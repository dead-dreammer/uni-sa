import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    # Always use a single, absolute database file
    PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))   # e.g. .../PROJECT/database_uni_sa
    DB_PATH = os.path.join(PROJECT_ROOT, "..", "university_matchmakers.db")
    DB_PATH = os.path.abspath(DB_PATH)

    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app, resources={r"/*": {"origins": "*"}})
    db.init_app(app)

    from database_uni_sa.routes import routes_blueprint
    app.register_blueprint(routes_blueprint)

    return app
