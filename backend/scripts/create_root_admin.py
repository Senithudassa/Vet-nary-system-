import sys
import os

# Ensure we can import the FastAPI app's modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.supabase_admin import supabase_admin
from app.core.logging import logger

def make_root_admin(email: str):
    """
    ONE-TIME SETUP SCRIPT:
    Grants 'main_admin' privileges to a specific Supabase user by email.
    
    Usage:
    python3 scripts/create_root_admin.py "your.email@example.com"
    """
    try:
        if not supabase_admin:
            print("\n[ERROR] Supabase Admin client not initialized. Check your .env file.\n")
            return
            
        # Fetch the user from Supabase 
        # Note: In a large production db you'd query the DB directly, but for admin scripts listing is fine
        users_resp = supabase_admin.auth.admin.list_users()
        user = next((u for u in users_resp if u.email == email), None)
        
        if not user:
            print(f"\n[ERROR] User with email '{email}' not found in Supabase.")
            print("Please sign up first on the frontend (/register or /login) before running this script.\n")
            return
            
        # Assign the custom claim directly bypassing the API
        supabase_admin.auth.admin.update_user_by_id(
            user.id,
            {"app_metadata": {"role": "main_admin"}}
        )
        
        print(f"\n[SUCCESS] Granted 'main_admin' role to: {user.email} (UID: {user.id})")
        print("This user can now access the Main Admin Web Portal and the /api/v1/auth/assign-role endpoint.\n")
        
    except Exception as e:
        logger.error(f"Failed to assign root admin claim: {e}")
        print(f"\n[ERROR] An unexpected error occurred: {e}\n")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("\nUsage: python3 scripts/create_root_admin.py <email_address>\n")
        sys.exit(1)
        
    target_email = sys.argv[1]
    make_root_admin(target_email)
