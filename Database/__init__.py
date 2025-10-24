from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from os import path
from flask_cors import CORS

db = SQLAlchemy()
DB_NAME = "database.db"

def create_database(app):
    if not path.exists(DB_NAME):
        with app.app_context():
            db.create_all()
            print('✅ Created Database and Tables!')

    else:
        print('Database already exists!')

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['SECRET_KEY'] = 'dalziel'

    # Set up the database URI
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{DB_NAME}"

    # Ensure that the SQLAlchemy instance is properly initialized with the app
    db.init_app(app)

    # Access the database engine within the application context
    with app.app_context():
        # Check if the SQLAlchemy engine is initialized
        if db.engine is not None:
            print("Flask app is connected to the database.")
        else:
            print("Flask app is NOT connected to the database.")

    # Import blueprints and models within the function scope to avoid circular imports
    from .auth import auth
    from .search import search

    # Register blueprints
    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(search, url_prefix='/search')

    from .models import Student
    from .models import AcademicMark
    from .models import Preference  
    
    # Create the database if it doesn't exist
    create_database(app)
    return app