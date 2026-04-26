import logging
import json
import re
from datetime import datetime
from typing import Any, Dict

# Basic PII stripping regex patterns
PII_PATTERNS = {
    "email": re.compile(r"[\w\.-]+@[\w\.-]+\.\w+"),
    "phone": re.compile(r"\b\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}\b"),
    "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
}

class PIIStrippingFormatter(logging.Formatter):
    """
    A custom logging formatter that converts logs to JSON and masks PII.
    Secure by default: never logs full email addresses or phone numbers.
    """
    def format(self, record: logging.LogRecord) -> str:
        # Create a dictionary of the log record
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Mask PII in the message string
        for pii_type, pattern in PII_PATTERNS.items():
            log_data["message"] = pattern.sub(f"[MASKED_{pii_type.upper()}]", log_data["message"])

        # Include any extra kwargs passed to the logger
        if hasattr(record, "extra_info"):
            def recursive_mask(item: Any) -> Any:
                if isinstance(item, str):
                    clean_v = item
                    for p_type, pat in PII_PATTERNS.items():
                        clean_v = pat.sub(f"[MASKED_{p_type.upper()}]", clean_v)
                    return clean_v
                elif isinstance(item, dict):
                    return {k: recursive_mask(v) for k, v in item.items()}
                elif isinstance(item, list):
                    return [recursive_mask(i) for i in item]
                return item
                
            log_data["extra_info"] = recursive_mask(record.extra_info)

        return json.dumps(log_data)

def setup_secure_logger(name: str = "vetnary_app") -> logging.Logger:
    logger = logging.getLogger(name)
    
    # Avoid attaching multiple handlers if already setup
    if logger.hasHandlers():
        return logger

    logger.setLevel(logging.INFO)
    
    # Optional: Log securely to a rotating file in production
    import os
    os.makedirs("secure_logs", exist_ok=True)
    file_handler = logging.FileHandler("secure_logs/app.log")
    
    # Ensure stdout is also masked
    stream_handler = logging.StreamHandler()
    
    formatter = PIIStrippingFormatter()
    file_handler.setFormatter(formatter)
    stream_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    logger.addHandler(stream_handler)
    
    return logger

logger = setup_secure_logger()
