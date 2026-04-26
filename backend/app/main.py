from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import logger
from app.core.security import zero_trust_auth_middleware, ai_quota_middleware

app = FastAPI(
    title="Vetnary System API - Zero Trust",
    description="Backend API secured with Zero Trust architecture and Rate Limiting.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-production-domain.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Apply Zero Trust & AI Rate Limiting Middlewares
app.add_middleware(BaseHTTPMiddleware, dispatch=ai_quota_middleware)
app.add_middleware(BaseHTTPMiddleware, dispatch=zero_trust_auth_middleware)

# API Routers
from app.api.v1 import roles
app.include_router(roles.router, prefix="/api/v1/auth", tags=["Authentication & Roles"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Vetnary System API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
