import shutil
import os
from datetime import datetime

# Get the folder one level above 'uni-sa'
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))

# Path to your actual database file outside uni-sa
DB_PATH = os.path.join(BASE_DIR, "instance/database.db")

# Folder inside uni-sa to save backups
BACKUP_DIR = os.path.join(os.path.dirname(__file__), "..", "backups")

def backup_database():
    os.makedirs(BACKUP_DIR, exist_ok=True)

    if not os.path.exists(DB_PATH):
        print(f"❌ Database file not found at: {DB_PATH}")
        return

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"database_backup_{timestamp}.db"
    backup_path = os.path.join(BACKUP_DIR, backup_filename)

    shutil.copy2(DB_PATH, backup_path)
    print(f"✅ Backup created successfully: {backup_path}")

if __name__ == "__main__":
    backup_database()
