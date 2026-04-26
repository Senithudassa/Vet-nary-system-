import time
from typing import Callable, Dict
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from .logging import logger

# ---------------------------------------------------------
# Zero Trust Identity Verification Layer (Middleware)
# ---------------------------------------------------------
async def zero_trust_auth_middleware(request: Request, call_next: Callable):
    """
    Zero Trust Principle: "Never Trust, Always Verify."
    Intercepts every incoming request to validate JWT authenticity and Integrity 
    before it touches the AI layer or Database logic.
    """
    
    # Exclude public paths (health checks, webhooks)
    if request.url.path in ["/health", "/api/v1/auth/login"]:
        return await call_next(request)

    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        logger.warning("Zero Trust Violation: Missing or invalid Authorization header", extra_info={"path": request.url.path, "ip": request.client.host})
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Zero Trust Error: Identity cannot be verified. Missing credentials."}
        )
    
    token = auth_header.split(" ")[1]
    
    try:
        # -----------------------------------------------------
        # ACTUAL ZERO TRUST VERIFICATION via Supabase Auth
        # -----------------------------------------------------
        # get_user verifies the JWT with the Supabase auth server and ensures it isn't revoked
        from app.core.supabase_admin import supabase_admin
        
        # When testing locally without a frontend sending real tokens, we can mock it 
        # But in production, this strict check CANNOT BE BYPASSED.
        from app.core.config import settings
        if token == "mock_local_dev_token" and settings.ENV != "production":
            logger.info("Local Dev Mock Token detected. Allowing bypass for testing.")
            request.state.user = {"uid": "mock_vet_123", "role": "vet"}
        else:
            if not supabase_admin:
                raise Exception("Supabase admin client not available.")
            
            user_response = supabase_admin.auth.get_user(token)
            if not user_response or not user_response.user:
                raise Exception("Invalid Supabase token")
            
            # Flatten the User object to match the expected decoded_token shape
            user_data = {
                "uid": user_response.user.id,
                "email": user_response.user.email,
                "role": user_response.user.app_metadata.get("role", "customer")
            }
            request.state.user = user_data 
            logger.info("Zero Trust Success: Token Verified", extra_info={"uid": user_data.get("uid")})
        
    except Exception as e:
        logger.warning(f"Zero Trust Violation: Invalid token - {str(e)}", extra_info={"ip": request.client.host})
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Zero Trust Error: Credential integrity check failed. Token may be expired or tampered with."}
        )

    response = await call_next(request)
    return response


# ---------------------------------------------------------
# Robust AI Rate Limiting (Fixed Window / Token Bucket Logic)
# ---------------------------------------------------------

# In-memory dictionary to mock a Redis implementation for rate limiting
# Key: UserID or IP | Value: {"tokens": int, "last_refill": float}
ai_rate_limits: Dict[str, Dict[str, float]] = {}

MAX_AI_REQUESTS_PER_MINUTE = 5
REFILL_RATE_SECONDS = 60

def check_ai_rate_limit(client_id: str) -> bool:
    """
    Standard Token Bucket / Fixed Window logic to prevent AI Model abuse.
    Prevents high-cost scraping and LLM quota exhaustion.
    """
    now = time.time()
    
    if client_id not in ai_rate_limits:
        ai_rate_limits[client_id] = {"tokens": MAX_AI_REQUESTS_PER_MINUTE - 1, "last_refill": now}
        return True
    
    bucket = ai_rate_limits[client_id]
    
    # Refill logic
    time_passed = now - bucket["last_refill"]
    if time_passed > REFILL_RATE_SECONDS:
        bucket["tokens"] = MAX_AI_REQUESTS_PER_MINUTE
        bucket["last_refill"] = now
        
    # Check if allowed
    if bucket["tokens"] > 0:
        bucket["tokens"] -= 1
        return True
    
    return False

async def ai_quota_middleware(request: Request, call_next: Callable):
    """
    Middleware strictly wrapping AI inference endpoints.
    """
    # Only strictly rate limit specific high-compute AI endpoints
    if "/api/v1/ai/" in request.url.path:
        
        # Use verified Zero Trust ID if available, otherwise fallback to IP
        client_id = getattr(request.state, "user", {}).get("uid", request.client.host)
        
        if not check_ai_rate_limit(client_id):
            logger.warning("AI Rate Limit Triggered. Blocking request.", extra_info={"client_id": client_id})
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "AI Quota Exhausted. Please wait before asking another question."}
            )

    return await call_next(request)
