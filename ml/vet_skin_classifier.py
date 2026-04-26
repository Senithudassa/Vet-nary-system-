"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  VetNary System — Skin Disease Classifier (MobileNetV2 Transfer Learning)  ║
║                                                                            ║
║  Target Classes : Mange · Ringworm · Healthy Dermis                        ║
║  Framework      : PyTorch                                                  ║
║  Runtime        : Google Colab (GPU)                                       ║
║                                                                            ║
║  Dataset        : "Dog's Skin Diseases (Image Dataset)" — Kaggle           ║
║  Author         : VetNary Dev Team                                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

INSTRUCTIONS — Run each section as a separate Colab cell (marked with # ══ CELL).
"""

# ══════════════════════════════════════════════════════════════════════════════
# CELL 1 — Environment bootstrap & GPU check
# ══════════════════════════════════════════════════════════════════════════════

import os
import copy
import time
import json
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
from collections import defaultdict

import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.utils.data import DataLoader, random_split
import torchvision
from torchvision import datasets, models, transforms

# ── GPU availability ──
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🔧  PyTorch {torch.__version__}")
print(f"🖥️  Device : {device}")
if device.type == "cuda":
    print(f"🚀  GPU    : {torch.cuda.get_device_name(0)}")
    print(f"💾  VRAM   : {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} GB")
else:
    print("⚠️  No GPU detected — training will be very slow!")


# ══════════════════════════════════════════════════════════════════════════════
# CELL 2 — Download dataset via KaggleHub (runs directly in Colab)
# ══════════════════════════════════════════════════════════════════════════════

import kagglehub
import shutil

# Download the dataset (kagglehub is pre-installed on Colab)
raw_dataset_path = kagglehub.dataset_download(
    "youssefmohmmed/dogs-skin-diseases-image-dataset"
)
print(f"📥  Raw dataset downloaded to: {raw_dataset_path}")

# ── Copy only our 3 target classes from the pre-split dataset ──
# Kaggle structure: raw_path/{train,valid,test}/{demodicosis,Healthy,ringworm,...}
# We want:          VetDataset/{train,val}/{Mange,Healthy_Dermis,Ringworm}
DATASET_DIR = "/content/VetDataset"

FOLDER_MAP = {
    "demodicosis": "Mange",               # Demodectic mange
    "Healthy":     "Healthy_Dermis",       # Normal skin
    "ringworm":    "Ringworm",             # Dermatophytosis
}

# Map Kaggle split names → our split names
SPLIT_MAP = {
    "train": "train",
    "valid": "val",     # rename 'valid' → 'val' for consistency
}

for kaggle_split, our_split in SPLIT_MAP.items():
    print(f"\n📂  Processing {kaggle_split}/ → {our_split}/")
    for src_name, dst_name in FOLDER_MAP.items():
        src = os.path.join(raw_dataset_path, kaggle_split, src_name)
        dst = os.path.join(DATASET_DIR, our_split, dst_name)
        if os.path.isdir(src) and not os.path.isdir(dst):
            shutil.copytree(src, dst)
            print(f"  ✅  {src_name:>15s}  →  {our_split}/{dst_name}  "
                  f"({len(os.listdir(dst))} images)")
        elif os.path.isdir(dst):
            print(f"  ⏩  {our_split}/{dst_name} already exists — skipping")
        else:
            print(f"  ⚠️  Source folder '{kaggle_split}/{src_name}' not found")

print(f"\n📂  Prepared dataset at: {DATASET_DIR}")
print(f"    train/ classes: {sorted(os.listdir(os.path.join(DATASET_DIR, 'train')))}")
print(f"    val/   classes: {sorted(os.listdir(os.path.join(DATASET_DIR, 'val')))}")


# ══════════════════════════════════════════════════════════════════════════════
# CELL 3 — Mount Google Drive (to persist model output)
# ══════════════════════════════════════════════════════════════════════════════

DRIVE_OUTPUT_DIR = "/content/drive/MyDrive/VetModel"   # where .pt file will be saved

try:
    from google.colab import drive
    drive.mount("/content/drive")
    os.makedirs(DRIVE_OUTPUT_DIR, exist_ok=True)
    print(f"📂  Google Drive mounted — model will be saved to: {DRIVE_OUTPUT_DIR}")
except ImportError:
    DRIVE_OUTPUT_DIR = "/content/VetModel"              # fallback if not on Colab
    os.makedirs(DRIVE_OUTPUT_DIR, exist_ok=True)
    print(f"ℹ️  Not running in Colab — model will be saved to: {DRIVE_OUTPUT_DIR}")


# ══════════════════════════════════════════════════════════════════════════════
# CELL 4 — Configuration (all tuneable hyperparameters live here)
# ══════════════════════════════════════════════════════════════════════════════

CONFIG = {
    # ── Paths (auto-set from Cells 2 & 3) ──
    "dataset_root": DATASET_DIR,
    "model_save_path": os.path.join(DRIVE_OUTPUT_DIR, "vet_skin_mobilenetv2.pt"),
    "curves_save_path": os.path.join(DRIVE_OUTPUT_DIR, "training_curves.png"),

    # ── Dataset ──
    "class_names": ["Healthy_Dermis", "Mange", "Ringworm"],  # ImageFolder alphabetical
    "num_classes": 3,
    "val_split": 0.20,              # 80-20 train/val if not pre-split
    "image_size": 224,              # MobileNetV2 native input size

    # ── Training ──
    "batch_size": 32,
    "num_workers": 2,
    "epochs": 30,                   # max epochs (early stopping may cut short)
    "learning_rate": 1e-3,          # starting LR for Adam
    "weight_decay": 1e-4,           # L2 regularisation

    # ── Anti-Overfitting ──
    "dropout_rate": 0.35,           # dropout in classifier head
    "lr_scheduler_patience": 3,     # epochs to wait before reducing LR
    "lr_scheduler_factor": 0.5,     # multiply LR by this on plateau
    "early_stop_patience": 7,       # epochs of no val-loss improvement → stop

    # ── Reproducibility ──
    "seed": 42,
}

# Seed everything for reproducibility
torch.manual_seed(CONFIG["seed"])
np.random.seed(CONFIG["seed"])
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(CONFIG["seed"])

print("✅  Config loaded")
print(json.dumps({k: v for k, v in CONFIG.items()}, indent=2, default=str))


# ══════════════════════════════════════════════════════════════════════════════
# CELL 5 — Data transforms & loading
# ══════════════════════════════════════════════════════════════════════════════

# ── Augmentations (training) ──
# These combat overfitting by presenting different views of each image every
# epoch so the model cannot memorise raw pixel patterns.
train_transforms = transforms.Compose([
    transforms.RandomResizedCrop(CONFIG["image_size"], scale=(0.7, 1.0)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomVerticalFlip(p=0.2),
    transforms.RandomRotation(degrees=25),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1),
    transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
    transforms.RandomGrayscale(p=0.05),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],   # ImageNet stats
                         std=[0.229, 0.224, 0.225]),
])

# ── Deterministic (validation) ──
val_transforms = transforms.Compose([
    transforms.Resize(CONFIG["image_size"] + 32),    # slight up-size
    transforms.CenterCrop(CONFIG["image_size"]),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])


def load_datasets(root: str) -> tuple:
    """
    Loads image data.  Supports two directory layouts:

      Layout A  (pre-split):          Layout B  (single root):
      root/                           root/
      ├── train/                      ├── Healthy_Dermis/
      │   ├── Mange/                  ├── Mange/
      │   └── ...                     └── Ringworm/
      └── val/
          ├── Mange/
          └── ...
    """
    train_dir = os.path.join(root, "train")
    val_dir   = os.path.join(root, "val")

    # Also check for 'valid' (some datasets use this instead of 'val')
    if not os.path.isdir(val_dir):
        val_dir = os.path.join(root, "valid")

    if os.path.isdir(train_dir) and os.path.isdir(val_dir):
        # Layout A — already split
        print(f"📁  Detected pre-split dataset (train/ & {os.path.basename(val_dir)}/)")  
        train_dataset = datasets.ImageFolder(train_dir, transform=train_transforms)
        val_dataset   = datasets.ImageFolder(val_dir,   transform=val_transforms)
    else:
        # Layout B — auto-split
        print(f"📁  Single-root dataset detected → auto-splitting "
              f"{int((1-CONFIG['val_split'])*100)}/{int(CONFIG['val_split']*100)} "
              f"train/val")
        full_dataset = datasets.ImageFolder(root, transform=train_transforms)
        val_size     = int(len(full_dataset) * CONFIG["val_split"])
        train_size   = len(full_dataset) - val_size
        train_dataset, val_dataset = random_split(
            full_dataset, [train_size, val_size],
            generator=torch.Generator().manual_seed(CONFIG["seed"]),
        )
        # Override transform for val split
        val_dataset.dataset = copy.deepcopy(full_dataset)
        val_dataset.dataset.transform = val_transforms

    return train_dataset, val_dataset


# ── Load ──
train_dataset, val_dataset = load_datasets(CONFIG["dataset_root"])

train_loader = DataLoader(
    train_dataset,
    batch_size=CONFIG["batch_size"],
    shuffle=True,
    num_workers=CONFIG["num_workers"],
    pin_memory=True,
)
val_loader = DataLoader(
    val_dataset,
    batch_size=CONFIG["batch_size"],
    shuffle=False,
    num_workers=CONFIG["num_workers"],
    pin_memory=True,
)

# ── Class mapping ──
if hasattr(train_dataset, "class_to_idx"):
    class_to_idx = train_dataset.class_to_idx
elif hasattr(train_dataset, "dataset"):
    class_to_idx = train_dataset.dataset.class_to_idx
else:
    class_to_idx = {c: i for i, c in enumerate(CONFIG["class_names"])}

idx_to_class = {v: k for k, v in class_to_idx.items()}

print(f"\n📊  Training samples   : {len(train_dataset):,}")
print(f"📊  Validation samples : {len(val_dataset):,}")
print(f"🏷️  Class mapping      : {class_to_idx}")


# ══════════════════════════════════════════════════════════════════════════════
# CELL 6 — Visualise a batch (sanity check)
# ══════════════════════════════════════════════════════════════════════════════

def show_batch(loader, n=8):
    """Display *n* images from the loader with their labels."""
    images, labels = next(iter(loader))
    images = images[:n]
    labels = labels[:n]

    # Un-normalise for display
    mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
    std  = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
    images = images * std + mean
    images = torch.clamp(images, 0, 1)

    fig, axes = plt.subplots(1, n, figsize=(n * 2.5, 3))
    for i in range(n):
        axes[i].imshow(images[i].permute(1, 2, 0).numpy())
        axes[i].set_title(idx_to_class.get(labels[i].item(), "?"), fontsize=10)
        axes[i].axis("off")
    plt.suptitle("Sample Training Batch", fontsize=14, y=1.02)
    plt.tight_layout()
    plt.show()

show_batch(train_loader)


# ══════════════════════════════════════════════════════════════════════════════
# CELL 7 — Build the model (MobileNetV2 + custom classifier head)
# ══════════════════════════════════════════════════════════════════════════════

def build_model(num_classes: int, dropout: float) -> nn.Module:
    """
    Load a pre-trained MobileNetV2, freeze all convolutional (feature) layers,
    and replace the classifier head with a new head targeting *num_classes*.
    """
    # Load pre-trained weights
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)

    # ── 1.  FREEZE all foundational / feature extraction layers ──
    for param in model.features.parameters():
        param.requires_grad = False

    # ── 2.  REPLACE the classifier head ──
    # Original: nn.Sequential(Dropout(0.2), Linear(1280, 1000))
    in_features = model.classifier[1].in_features   # 1280

    model.classifier = nn.Sequential(
        nn.Dropout(p=dropout),
        nn.Linear(in_features, 512),
        nn.ReLU(inplace=True),
        nn.BatchNorm1d(512),
        nn.Dropout(p=dropout / 2),
        nn.Linear(512, 128),
        nn.ReLU(inplace=True),
        nn.BatchNorm1d(128),
        nn.Dropout(p=dropout / 3),
        nn.Linear(128, num_classes),       # raw logits → softmax at inference
    )

    # Verify freeze
    total   = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    frozen  = total - trainable
    print(f"\n🧠  Model Summary")
    print(f"   Total params     : {total:>12,}")
    print(f"   Trainable params : {trainable:>12,}  (classifier head)")
    print(f"   Frozen params    : {frozen:>12,}  (MobileNetV2 backbone)")

    return model.to(device)


model = build_model(CONFIG["num_classes"], CONFIG["dropout_rate"])


# ══════════════════════════════════════════════════════════════════════════════
# CELL 8 — Loss, optimiser, LR scheduler
# ══════════════════════════════════════════════════════════════════════════════

criterion = nn.CrossEntropyLoss()

# Only optimise parameters that require gradients (the unfrozen head)
optimizer = optim.Adam(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=CONFIG["learning_rate"],
    weight_decay=CONFIG["weight_decay"],
)

# Reduce LR when validation loss plateaus
scheduler = ReduceLROnPlateau(
    optimizer,
    mode="min",
    patience=CONFIG["lr_scheduler_patience"],
    factor=CONFIG["lr_scheduler_factor"],
    verbose=True,
)

print(f"\n⚙️  Optimiser  : Adam (lr={CONFIG['learning_rate']}, wd={CONFIG['weight_decay']})")
print(f"⚙️  Scheduler  : ReduceLROnPlateau (patience={CONFIG['lr_scheduler_patience']}, "
      f"factor={CONFIG['lr_scheduler_factor']})")
print(f"⚙️  Criterion  : CrossEntropyLoss")


# ══════════════════════════════════════════════════════════════════════════════
# CELL 9 — Training loop with early stopping
# ══════════════════════════════════════════════════════════════════════════════

class EarlyStopping:
    """Stop training when validation loss stops improving."""
    def __init__(self, patience: int = 5, min_delta: float = 1e-4):
        self.patience  = patience
        self.min_delta = min_delta
        self.counter   = 0
        self.best_loss = float("inf")

    def __call__(self, val_loss: float) -> bool:
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
            return False          # keep training
        self.counter += 1
        if self.counter >= self.patience:
            print(f"\n🛑  Early stopping triggered (no improvement for "
                  f"{self.patience} epochs)")
            return True           # stop training
        return False


def train_one_epoch(model, loader, criterion, optimizer):
    """Run ONE training epoch. Returns (avg_loss, accuracy)."""
    model.train()
    running_loss = 0.0
    correct = 0
    total   = 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total   += labels.size(0)

    epoch_loss = running_loss / total
    epoch_acc  = correct / total
    return epoch_loss, epoch_acc


@torch.no_grad()
def validate(model, loader, criterion):
    """Run ONE validation pass. Returns (avg_loss, accuracy)."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total   = 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)

        outputs = model(images)
        loss = criterion(outputs, labels)

        running_loss += loss.item() * images.size(0)
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total   += labels.size(0)

    epoch_loss = running_loss / total
    epoch_acc  = correct / total
    return epoch_loss, epoch_acc


# ── Main training loop ──
def train_model(model, train_loader, val_loader, criterion, optimizer,
                scheduler, config):
    """
    Full training pipeline.
    Returns the model with the best validation accuracy loaded,
    plus a history dict for plotting.
    """
    num_epochs   = config["epochs"]
    es           = EarlyStopping(patience=config["early_stop_patience"])
    best_val_acc = 0.0
    best_weights = copy.deepcopy(model.state_dict())

    history = defaultdict(list)

    print("\n" + "=" * 70)
    print("  TRAINING STARTED")
    print("=" * 70)
    start_time = time.time()

    for epoch in range(1, num_epochs + 1):
        epoch_start = time.time()

        # Train
        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer
        )
        # Validate
        val_loss, val_acc = validate(model, val_loader, criterion)

        # LR scheduler step (monitors val loss)
        scheduler.step(val_loss)
        current_lr = optimizer.param_groups[0]["lr"]

        # Logging
        elapsed = time.time() - epoch_start
        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)
        history["lr"].append(current_lr)

        # Progress bar
        bar_len  = 30
        fill     = int(bar_len * epoch / num_epochs)
        bar      = "█" * fill + "░" * (bar_len - fill)

        print(f"\nEpoch {epoch:>3}/{num_epochs}  [{bar}]  {elapsed:.0f}s")
        print(f"  Train ▸ loss: {train_loss:.4f}  acc: {train_acc:.4f}")
        print(f"  Val   ▸ loss: {val_loss:.4f}  acc: {val_acc:.4f}")
        print(f"  LR    ▸ {current_lr:.2e}")

        # Checkpoint best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_weights = copy.deepcopy(model.state_dict())
            print(f"  ✅  New best val accuracy: {best_val_acc:.4f} — weights saved")

        # Early stopping check
        if es(val_loss):
            break

    total_time = time.time() - start_time
    print("\n" + "=" * 70)
    print(f"  TRAINING COMPLETE — {total_time / 60:.1f} min total")
    print(f"  Best validation accuracy: {best_val_acc:.4f}")
    print("=" * 70)

    # Load best weights
    model.load_state_dict(best_weights)
    return model, dict(history)


# ── Run ──
model, history = train_model(
    model, train_loader, val_loader, criterion, optimizer, scheduler, CONFIG
)


# ══════════════════════════════════════════════════════════════════════════════
# CELL 10 — Plot training curves
# ══════════════════════════════════════════════════════════════════════════════

def plot_history(history: dict):
    """Plot loss, accuracy, and learning rate curves."""
    epochs = range(1, len(history["train_loss"]) + 1)

    fig, axes = plt.subplots(1, 3, figsize=(18, 5))

    # Loss
    axes[0].plot(epochs, history["train_loss"], "o-", label="Train Loss")
    axes[0].plot(epochs, history["val_loss"],   "o-", label="Val Loss")
    axes[0].set_title("Loss per Epoch", fontsize=13, fontweight="bold")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("CrossEntropy Loss")
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    # Accuracy
    axes[1].plot(epochs, history["train_acc"], "o-", label="Train Acc")
    axes[1].plot(epochs, history["val_acc"],   "o-", label="Val Acc")
    axes[1].set_title("Accuracy per Epoch", fontsize=13, fontweight="bold")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Accuracy")
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    # Learning Rate
    axes[2].plot(epochs, history["lr"], "o-", color="green")
    axes[2].set_title("Learning Rate Schedule", fontsize=13, fontweight="bold")
    axes[2].set_xlabel("Epoch")
    axes[2].set_ylabel("LR")
    axes[2].set_yscale("log")
    axes[2].grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(CONFIG["curves_save_path"], dpi=150)
    plt.show()
    print("📊  Training curves saved")

plot_history(history)


# ══════════════════════════════════════════════════════════════════════════════
# CELL 11 — Export model weights
# ══════════════════════════════════════════════════════════════════════════════

def export_model(model, config, class_mapping):
    """
    Save the fine-tuned model as a .pt checkpoint containing:
    - state_dict          (model weights)
    - class_to_idx        (label mapping)
    - config              (hyperparameters used)
    - architecture_info   (human-readable)
    """
    save_path = config["model_save_path"]
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    checkpoint = {
        "model_state_dict": model.state_dict(),
        "class_to_idx": class_mapping,
        "idx_to_class": {v: k for k, v in class_mapping.items()},
        "config": config,
        "architecture": "MobileNetV2 (frozen backbone) + custom classifier head",
        "input_size": config["image_size"],
        "num_classes": config["num_classes"],
        "normalize_mean": [0.485, 0.456, 0.406],
        "normalize_std": [0.229, 0.224, 0.225],
    }

    torch.save(checkpoint, save_path)
    file_size = os.path.getsize(save_path) / (1024 * 1024)
    print(f"\n💾  Model exported to: {save_path}")
    print(f"    File size: {file_size:.1f} MB")
    print(f"    Contains: state_dict, class_to_idx, config, normalize stats")

    return save_path

export_path = export_model(model, CONFIG, class_to_idx)


# ══════════════════════════════════════════════════════════════════════════════
# CELL 12 — Quick inference test (verify the export works)
# ══════════════════════════════════════════════════════════════════════════════

def predict_single_image(image_path: str, model_path: str):
    """
    Load the exported model and run inference on a single image.
    Returns predicted class name and confidence scores.
    """
    from PIL import Image

    # Load checkpoint
    checkpoint = torch.load(model_path, map_location=device, weights_only=False)                          

    # Rebuild model
    model = models.mobilenet_v2(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=checkpoint["config"]["dropout_rate"]),
        nn.Linear(in_features, 512),
        nn.ReLU(inplace=True),
        nn.BatchNorm1d(512),
        nn.Dropout(p=checkpoint["config"]["dropout_rate"] / 2),
        nn.Linear(512, 128),
        nn.ReLU(inplace=True),
        nn.BatchNorm1d(128),
        nn.Dropout(p=checkpoint["config"]["dropout_rate"] / 3),
        nn.Linear(128, checkpoint["num_classes"]),
    )
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()

    # Preprocess
    transform = transforms.Compose([
        transforms.Resize(checkpoint["input_size"] + 32),
        transforms.CenterCrop(checkpoint["input_size"]),
        transforms.ToTensor(),
        transforms.Normalize(mean=checkpoint["normalize_mean"],
                             std=checkpoint["normalize_std"]),
    ])

    image = Image.open(image_path).convert("RGB")
    input_tensor = transform(image).unsqueeze(0).to(device)

    # Infer
    with torch.no_grad():
        outputs = model(input_tensor)
        probs   = torch.softmax(outputs, dim=1)[0]

    idx_to_class = checkpoint["idx_to_class"]
    pred_idx     = probs.argmax().item()
    pred_class   = idx_to_class[pred_idx]
    confidence   = probs[pred_idx].item()

    print(f"\n🔍  Prediction: {pred_class}  ({confidence*100:.1f}% confidence)")
    for idx, prob in enumerate(probs):
        bar = "█" * int(prob * 30)
        print(f"    {idx_to_class[idx]:>15s} : {prob*100:5.1f}%  {bar}")

    return pred_class, {idx_to_class[i]: p.item() for i, p in enumerate(probs)}


# ── Example usage (uncomment and set your image path) ──
# predict_single_image("/content/drive/MyDrive/VetDataset/test_image.jpg", export_path)

print("\n✅  All cells complete!  Your model is saved and ready for deployment.")
print(f"    Model path: {export_path}")
print(f"    To integrate with the VetNary app, load the .pt file in your backend.")
