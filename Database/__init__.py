from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from os import path
from Database.backup import backup_database, restore_latest_backup

db = SQLAlchemy()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")
BACKUP_DIR = os.path.join(BASE_DIR, "backups")

def create_database(app):
    """Ensure the database exists and all tables are created."""
    if not path.exists(DB_PATH):
        print("⚠️ Main database missing...")
        restored = restore_latest_backup(DB_PATH, BACKUP_DIR)
        if restored:
            print("✅ Restored database from latest backup.")
        else:
            with app.app_context():
                db.create_all()
                print("🆕 Created new database and tables (no backup found).")
    else:
        print(f"✅ Database already exists at: {DB_PATH}")

    # Ensure tables exist
    with app.app_context():
        db.create_all()
        print("📦 Verified all tables exist.")

def create_app():
    """Initialize Flask app, database, and backup."""
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    CORS(app)
    app.config['SECRET_KEY'] = 'dalziel'
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{DB_PATH}"

    # Initialize SQLAlchemy with app
    db.init_app(app)

    # Import models AFTER db.init_app(app)
    from .models import Student, AcademicMark, Preference, University, Program, Requirement, Application
    from .auth import auth
    from .search import search
    from .courses import courses

    # Register blueprints
    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(search, url_prefix='/search')
    app.register_blueprint(courses, url_prefix='/courses')

    # Create or restore database
    create_database(app)

    # Backup database
    backup_database(DB_PATH, BACKUP_DIR)

    return app
