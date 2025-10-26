import os
import shutil

def backup_database(db_path, backup_dir):
    os.makedirs(backup_dir, exist_ok=True)
    backup_file = os.path.join(backup_dir, "backup.db")
    if os.path.exists(db_path):
        shutil.copy(db_path, backup_file)
        print(f"✅ Database backup created at: {backup_file}")
    else:
        print("⚠️ No database found to back up.")

def restore_latest_backup(db_path, backup_dir):
    backup_file = os.path.join(backup_dir, "backup.db")
    if not os.path.exists(db_path) and os.path.exists(backup_file):
        shutil.copy(backup_file, db_path)
        print(f"✅ Restored database from backup: {backup_file}")
        return True
    elif not os.path.exists(db_path):
        print("⚠️ No backup found — cannot restore database.")
        return False
    return True
