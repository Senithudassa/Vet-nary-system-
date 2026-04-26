from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_health_check_public_access():
    """Verify that public routes like /health bypass Zero Trust."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_zero_trust_blocks_no_token():
    """Verify that hitting a protected route without a token fails."""
    response = client.get("/api/v1/auth/my-role")
    assert response.status_code == 401
    assert "Zero Trust Error" in response.json()["detail"]

def test_zero_trust_blocks_invalid_token():
    """Verify that hitting a protected route with a bad token fails."""
    headers = {"Authorization": "Bearer not_a_real_token_123"}
    response = client.get("/api/v1/auth/my-role", headers=headers)
    assert response.status_code == 403
    assert "Credential integrity check failed" in response.json()["detail"]

def test_zero_trust_allows_mock_token():
    """Verify our local dev bypass works so we can test roles."""
    headers = {"Authorization": "Bearer mock_local_dev_token"}
    response = client.get("/api/v1/auth/my-role", headers=headers)
    assert response.status_code == 200
    assert response.json()["user"]["uid"] == "mock_vet_123"

def test_role_assignment_blocked_for_vets():
    """
    Verify that our Zero Trust system blocks a Vet from assigning roles.
    Only Main Admins can do this!
    """
    headers = {"Authorization": "Bearer mock_local_dev_token"}
    payload = {"uid": "new_user_890", "role": "vet"}
    
    response = client.post(
        "/api/v1/auth/assign-role", 
        json=payload, 
        headers=headers
    )
    
    # Because our mock_local_dev_token has role="vet", it should be FORBIDDEN
    assert response.status_code == 403
    assert "Main Admin privileges" in response.json()["detail"]

def test_role_assignment_invalid_role():
    """Verify the API rejects weird roles."""
    headers = {"Authorization": "Bearer mock_local_dev_token"}
    
    payload = {"uid": "new_user_890", "role": "super_hacker"}
    response = client.post(
        "/api/v1/auth/assign-role", 
        json=payload, 
        headers=headers
    )
    
    assert response.status_code == 400
    assert "Invalid role provided" in response.json()["detail"]

