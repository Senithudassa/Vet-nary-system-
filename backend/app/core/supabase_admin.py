from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

supabase_url: str = settings.SUPABASE_URL
supabase_key: str = settings.SUPABASE_SERVICE_ROLE_KEY

# Initialize the Supabase Admin client
# Using the service role key bypasses Row Level Security (RLS) entirely
# This client should ONLY be used in secure backend routes like assigning custom claims
try:
    supabase_admin: Client = create_client(supabase_url, supabase_key)
except Exception as e:
    logger.error(f"Failed to initialize Supabase Admin client: {e}")
    supabase_admin = None
