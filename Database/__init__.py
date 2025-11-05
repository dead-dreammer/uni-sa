from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
import os
from os import path
from Database.backup import backup_database, restore_latest_backup

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

# Configuration constants
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")
BACKUP_DIR = os.path.join(BASE_DIR, "backups")


def create_database(app):
    """Ensure the database exists and all tables are created."""
    if not path.exists(DB_PATH):
        print("⚠️  Main database missing...")
        restored = restore_latest_backup(DB_PATH, BACKUP_DIR)
        if restored:
            print("✅ Restored database from latest backup.")
        else:
            with app.app_context():
                db.create_all()
                print("🆕 Created new database and tables (no backup found).")
    else:
        print(f"✅ Database already exists at: {DB_PATH}")

    # Ensure all tables exist (handles new models)
    with app.app_context():
        db.create_all()
        print("📦 Verified all tables exist.")


def register_models():
    """Import all models to ensure they're registered with SQLAlchemy."""
    from .models import (
        Student,
        AcademicMark,
        Preference,
        University,
        Program,
        Requirement,
        Application,
        Report,
        Admission,
        Bursary,
        LikedCourse,
        WSUniversity,
        WSProgram
    )
    print("📋 All models registered.")


def register_blueprints(app):
    """Register all application blueprints."""
    from routes.auth import auth
    from routes.search import search
    from routes.courses import courses
    from routes.bursary import bursary
    from routes.web_scrapping import ws
    from routes.admissions_calendar import admissions_bp
    from routes.reports import reports

    # Register blueprints with their URL prefixes
    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(search, url_prefix='/search')
    app.register_blueprint(courses, url_prefix='/courses')
    app.register_blueprint(bursary, url_prefix='/bursary')
    app.register_blueprint(ws, url_prefix='/ws')
    app.register_blueprint(admissions_bp, url_prefix='/admissions')
    app.register_blueprint(reports)  # No prefix - uses paths from routes/reports.py
    
    print("🔗 All blueprints registered.")


def create_app():
    """Initialize and configure the Flask application."""
    # Create Flask app instance
    app = Flask(
        __name__,
        template_folder='../templates',
        static_folder='../static'
    )
    
    # Configure app
    app.config['SECRET_KEY'] = 'dalziel'  # TODO: Move to environment variable in production
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{DB_PATH}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Suppress warning
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Register models (must be done after db.init_app)
    register_models()
    
    # Register all blueprints
    register_blueprints(app)
    
    # Initialize database
    create_database(app)
    
    # Create backup
    backup_database(DB_PATH, BACKUP_DIR)
    
    print("🚀 Application initialized successfully!")
    
    return app