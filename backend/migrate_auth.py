import sqlite3
import os
from pathlib import Path

db_path = Path(__file__).resolve().parent / "airbnb.db"
print(f"Applying auth migrations to SQLite database at: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Check existing columns in users table
cursor.execute("PRAGMA table_info(users);")
columns = [row[1] for row in cursor.fetchall()]
print(f"Existing users columns: {columns}")

# Add phone column if missing
if "phone" not in columns:
    print("Adding 'phone' column to users table...")
    cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(30);")
    cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_phone ON users(phone);")
    print("Added 'phone' column.")

# Add hashed_password column if missing
if "hashed_password" not in columns:
    print("Adding 'hashed_password' column to users table...")
    cursor.execute("ALTER TABLE users ADD COLUMN hashed_password VARCHAR(200);")
    print("Added 'hashed_password' column.")

# 2. Create otp_verifications table if missing
cursor.execute("""
CREATE TABLE IF NOT EXISTS otp_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier VARCHAR(120) NOT NULL,
    channel VARCHAR(20) DEFAULT 'sms',
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(20) DEFAULT 'login',
    expires_at DATETIME NOT NULL,
    attempts INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
""")
cursor.execute("CREATE INDEX IF NOT EXISTS ix_otp_verifications_id ON otp_verifications(id);")
cursor.execute("CREATE INDEX IF NOT EXISTS ix_otp_verifications_identifier ON otp_verifications(identifier);")
print("Verified 'otp_verifications' table exists.")

# 3. Update existing users with phone numbers if null
phone_mappings = {
    "rahul.sharma@example.com": "+919876543210",
    "priya.sharma@example.com": "+919876543211",
    "arjun.nair@example.com": "+919876543212",
    "aman.verma@example.com": "+919876543213",
    "aarav.patel@example.com": "+919876543214",
    "ananya.iyer@example.com": "+919876543215",
}

for email, phone in phone_mappings.items():
    cursor.execute("UPDATE users SET phone = ? WHERE email = ? AND (phone IS NULL OR phone = '');", (phone, email))

conn.commit()
print("Migration completed successfully.")

cursor.execute("SELECT id, name, email, phone FROM users LIMIT 6;")
for u in cursor.fetchall():
    print(f"User: id={u[0]}, name='{u[1]}', email='{u[2]}', phone='{u[3]}'")

conn.close()
