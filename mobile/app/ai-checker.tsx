import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/context/AuthContext";
import { usePets } from "@/hooks/usePets";
import { api, ScanResult } from "@/lib/api";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Return a badge colour based on confidence level */
function confidenceColour(confidence: number): string {
  if (confidence >= 80) return "#FF6B6B"; // high – red-ish
  if (confidence >= 50) return "#ffbe0a"; // medium – amber
  return "#D1FAE5"; // low – green
}

export default function ScannerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { pets } = usePets();

  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Measured dimensions of the result image box (for overlay positioning)
  const [imageBoxSize, setImageBoxSize] = useState({ width: 0, height: 0 });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setScanResult(null);
      setScanError(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera permission is required to take photos.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setScanResult(null);
      setScanError(null);
    }
  };

  const handleConfirmScan = async () => {
    if (!image) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const data = await api.scanSkin(image);
      setScanResult(data);
    } catch (err: any) {
      setScanError(err.message || "AI analysis failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  /** Compute the pixel position of the affected area box inside imageBoxSize */
  const getAffectedAreaStyle = () => {
    if (!scanResult || imageBoxSize.width === 0) return null;
    const { x, y, width, height } = scanResult.affectedArea;
    return {
      left: x * imageBoxSize.width,
      top: y * imageBoxSize.height,
      width: width * imageBoxSize.width,
      height: height * imageBoxSize.height,
    };
  };

  const hasScanned = scanResult !== null;

  const resetScan = () => {
    setImage(null);
    setScanResult(null);
    setScanError(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI SKIN SCANNER</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerSubtitle}>
          Upload a photo of your pet's rash or skin issue for an instant AI
          assessment.
        </Text>
        {/* ── Step 1: No image selected yet ── */}
        {!image ? (
          <View style={styles.uploadCard}>
            <View style={styles.cameraGraphic}>
              <IconSymbol name="camera.viewfinder" size={80} color="#000" />
            </View>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: "#FFEDD5" }]}
              onPress={takePhoto}
            >
              <Text style={styles.primaryActionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryActionBtn, { marginTop: 16 }]}
              onPress={pickImage}
            >
              <Text style={styles.secondaryActionText}>
                Upload from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        ) : /* ── Step 2: Scanning in progress ── */
        isScanning ? (
          <View style={styles.scanningCard}>
            <Image source={{ uri: image }} style={styles.scanningImage} />
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.scanningText}>
                AI is analysing the image…
              </Text>
            </View>
          </View>
        ) : /* ── Step 3: Confirm before scanning ── */
        !hasScanned ? (
          <View style={[styles.resultsCard, { padding: 0 }]}>
            <View style={{ padding: 20 }}>
              <Text style={styles.resultsTitle}>CONFIRM IMAGE</Text>
            </View>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <View style={{ padding: 20 }}>
              <TouchableOpacity
                style={[
                  styles.primaryActionBtn,
                  { backgroundColor: "#818CF8" },
                ]}
                onPress={handleConfirmScan}
              >
                <Text style={[styles.primaryActionText, { color: "#fff" }]}>
                  Scan This Image
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.secondaryActionBtn,
                  { marginTop: 12, borderStyle: "dashed" },
                ]}
                onPress={resetScan}
              >
                <Text style={styles.secondaryActionText}>
                  Choose Different Image
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : /* ── Step 4a: Scan error ── */
        scanError ? (
          <View style={styles.resultsCard}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>SCAN FAILED</Text>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={28}
                color="#FF6B6B"
              />
            </View>
            <Text
              style={[
                styles.diagnosisText,
                { color: "#FF6B6B", marginBottom: 20 },
              ]}
            >
              {scanError}
            </Text>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: "#FFEDD5" }]}
              onPress={handleConfirmScan}
            >
              <Text style={styles.primaryActionText}>Retry Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryActionBtn, { marginTop: 12 }]}
              onPress={resetScan}
            >
              <Text style={styles.secondaryActionText}>
                Choose Different Image
              </Text>
            </TouchableOpacity>
          </View>
        ) : /* ── Step 4b: Results ── */
        scanResult ? (
          <View>
            <View style={styles.resultsCard}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>ANALYSIS COMPLETE</Text>
                <IconSymbol
                  name="checkmark.seal.fill"
                  size={32}
                  color="#818CF8"
                />
              </View>

              {/* ── Image with affected-area bounding box ── */}
              <View
                style={styles.imagePreviewBox}
                onLayout={(e: LayoutChangeEvent) => {
                  const { width, height } = e.nativeEvent.layout;
                  setImageBoxSize({ width, height });
                }}
              >
                <Image
                  source={{ uri: image }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />

                {/* Affected area highlight */}
                {getAffectedAreaStyle() && (
                  <View
                    style={[styles.affectedAreaBox, getAffectedAreaStyle()!]}
                  />
                )}

                {/* Label */}
                {getAffectedAreaStyle() && (
                  <View
                    style={[
                      styles.affectedAreaLabel,
                      {
                        left: getAffectedAreaStyle()!.left,
                        top: Math.max(0, getAffectedAreaStyle()!.top - 26),
                      },
                    ]}
                  >
                    <Text style={styles.affectedAreaLabelText}>
                      Affected Area
                    </Text>
                  </View>
                )}
              </View>

              {/* ── Condition + Confidence ── */}
              <View style={styles.conditionRow}>
                <Text style={styles.conditionName}>{scanResult.condition}</Text>
                <View
                  style={[
                    styles.confidenceBadge,
                    {
                      backgroundColor: confidenceColour(scanResult.confidence),
                    },
                  ]}
                >
                  <Text style={styles.confidenceText}>
                    {scanResult.confidence}% Confidence
                  </Text>
                </View>
              </View>

              {/* ── Recommendation ── */}
              <View style={styles.recommendationBlock}>
                <View style={styles.recommendationHeader}>
                  <IconSymbol name="stethoscope" size={18} color="#000" />
                  <Text style={styles.recommendationTitle}>RECOMMENDATION</Text>
                </View>
                <Text style={styles.diagnosisText}>
                  {scanResult.recommendation}
                </Text>
              </View>
            </View>

            {/* ── Actions ── */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.primaryActionBtn,
                  { backgroundColor: "#D1FAE5", flex: 1, marginRight: 8 },
                ]}
                onPress={resetScan}
              >
                <Text style={styles.primaryActionText}>Scan New</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryActionBtn,
                  { backgroundColor: "#FEF08A", flex: 1 },
                ]}
              >
                <Text style={styles.primaryActionText}>Book Vet</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* ── Disclaimer ── */}
        <View style={styles.disclaimerBlock}>
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={24}
            color="#ffbe0a"
            style={{ marginRight: 12 }}
          />
          <Text style={styles.disclaimerText}>
            This AI tool is for preliminary guidance only and does not replace
            professional veterinary diagnosis.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#666",
    marginBottom: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // ── Upload / empty state ──────────────────────────────────────────────────
  uploadCard: {
    backgroundColor: "#ffb3ba",
    borderWidth: 4,
    borderColor: "#000",
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  cameraGraphic: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    borderStyle: "dashed",
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  primaryActionBtn: {
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
  },
  secondaryActionBtn: {
    width: "100%",
    backgroundColor: "transparent",
    borderWidth: 3,
    borderColor: "#000",
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000",
  },

  // ── Result card ───────────────────────────────────────────────────────────
  resultsCard: {
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#000",
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 3,
    borderColor: "#000",
    paddingBottom: 12,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
  },

  // ── Image preview with bounding box ──────────────────────────────────────
  imagePreviewBox: {
    width: "100%",
    height: 220,
    backgroundColor: "#e8e8e8",
    borderWidth: 3,
    borderColor: "#000",
    marginBottom: 20,
    overflow: "hidden",
  },
  affectedAreaBox: {
    position: "absolute",
    borderWidth: 3,
    borderColor: "#FF6B6B",
    borderStyle: "dashed",
    backgroundColor: "rgba(255, 107, 107, 0.15)",
  },
  affectedAreaLabel: {
    position: "absolute",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  affectedAreaLabelText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  // ── Condition & confidence ────────────────────────────────────────────────
  conditionRow: {
    marginBottom: 16,
    gap: 10,
  },
  conditionName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    lineHeight: 26,
  },
  confidenceBadge: {
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#000",
  },

  // ── Recommendation block ──────────────────────────────────────────────────
  recommendationBlock: {
    backgroundColor: "#F0F0FF",
    borderWidth: 2,
    borderColor: "#000",
    padding: 14,
    marginBottom: 20,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 0.5,
  },
  diagnosisText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    lineHeight: 22,
  },

  // ── Scanning overlay ──────────────────────────────────────────────────────
  previewImage: {
    width: "100%",
    height: 300,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: "#000",
  },
  scanningCard: {
    height: 400,
    backgroundColor: "#000",
    borderWidth: 4,
    borderColor: "#000",
    overflow: "hidden",
    position: "relative",
    marginBottom: 24,
  },
  scanningImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  scanningText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 20,
    textTransform: "uppercase",
  },

  // ── Bottom action row ─────────────────────────────────────────────────────
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },

  // ── Disclaimer ────────────────────────────────────────────────────────────
  disclaimerBlock: {
    flexDirection: "row",
    backgroundColor: "#000",
    padding: 16,
    alignItems: "center",
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 18,
  },
});
