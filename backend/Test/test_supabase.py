import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("[ERROR] Missing Supabase credentials in .env")
    sys.exit(1)

try:
    print(f"Connecting to Supabase at: {url}")
    supabase: Client = create_client(url, key)
    
    # 1. Test Auth Connection
    print("\n--- Test 1: Fetching Auth Users (Admin API) ---")
    users_resp = supabase.auth.admin.list_users()
    print(f"Successfully fetched {len(users_resp)} users.")
    for u in users_resp:
        print(f" - {u.email} (ID: {u.id})")
    
    # 2. Test Database Connection
    print("\n--- Test 2: Fetching Profiles Table ---")
    profiles_resp = supabase.table("profiles").select("*").execute()
    print(f"Profiles found: {len(profiles_resp.data)}")
    for p in profiles_resp.data:
        print(f" - {p}")

    print("\n--- Test 3: Fetching Clinics Table ---")
    clinics_resp = supabase.table("clinics").select("*").execute()
    print(f"Clinics found: {len(clinics_resp.data)}")
    for c in clinics_resp.data:
        print(f" - {c}")

    print("\n[SUCCESS] Supabase connection and database queries are working correctly.")
except Exception as e:
    print(f"\n[ERROR] Connection or Query Failed: {e}")
