import urllib.parse
import psycopg2

import os
from dotenv import load_dotenv

load_dotenv()
conn_str = os.getenv("SUPABASE_DATABASE_URL")
if not conn_str:
    print("Please set SUPABASE_DATABASE_URL in .env")
    exit(1)

print(f"Testing direct connection...")
try:
    conn = psycopg2.connect(conn_str)
    print("SUCCESS: Successfully connected to the PostgreSQL database directly!")
    cur = conn.cursor()
    cur.execute("SELECT version();")
    print("Database version:", cur.fetchone()[0])
    conn.close()
except Exception as e:
    print("ERROR connecting to database:", e)
