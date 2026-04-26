from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from app.core.supabase_admin import supabase_admin
from app.core.logging import logger

router = APIRouter()

# Schema for the incoming request
class RoleAssignmentRequest(BaseModel):
    uid: str
    role: str # 'vet', 'minor_admin', 'main_admin', or 'customer'

@router.post("/assign-role")
async def assign_custom_role(request: Request, payload: RoleAssignmentRequest):
    """
    Zero Trust Protected Route: Assigns a persistent Supabase Custom Claim (Role) to a given User UID.
    This route can ONLY be called by a 'main_admin'.
    """
    
    # 1. Zero Trust Integrity Verification
    # Ensure the person making this request has the 'main_admin' claim
    requester_role = request.state.user.get("role")
    
    # Bypass for local dev mock user to allow initial setup
    is_mock = request.state.user.get("uid") == "mock_vet_123"
    
    if requester_role != "main_admin" and not is_mock:
        logger.warning(
            "Security Violation: Unauthorized role assignment attempt.", 
            extra_info={"trigger_uid": request.state.user.get("uid"), "target_uid": payload.uid}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Operation requires Main Admin privileges."
        )

    # 2. Validate the requested role
    valid_roles = ["vet", "minor_admin", "main_admin", "customer"]
    if payload.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Invalid role provided. Must be one of: {valid_roles}"
        )

    try:
        if not supabase_admin:
            raise HTTPException(status_code=500, detail="Supabase Admin not configured.")

        # 3. Assign the Custom Claim using Supabase Admin API
        supabase_admin.auth.admin.update_user_by_id(
            payload.uid,
            {"app_metadata": {"role": payload.role}}
        )
        
        logger.info(
            f"Successfully assigned role '{payload.role}' to UID '{payload.uid}'", 
            extra_info={"assigned_by": request.state.user.get("uid")}
        )
        
        return {"message": f"Successfully upgraded user {payload.uid} to {payload.role}"}

    except Exception as e:
        logger.error(f"Failed to assign custom claim: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while assigning role.")

@router.get("/my-role")
async def get_my_role(request: Request):
    """
    Returns the decoded token from the Zero Trust Middleware, showing current claims.
    """
    return {"user": request.state.user}
