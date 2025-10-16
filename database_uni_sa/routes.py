# database_uni_sa/routes.py
from flask import Blueprint, request, jsonify
from sqlalchemy import text
from database_uni_sa import db
from database_uni_sa.models import Student

routes_blueprint = Blueprint("routes", __name__, url_prefix="")

# ---------- Health ----------
@routes_blueprint.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True}), 200

# ---------- Register ----------
@routes_blueprint.route("/register", methods=["POST"])
def register():
    if not request.is_json:
        return jsonify({"message": "Missing JSON data"}), 400

    data = request.get_json()
    first_name = (data.get("first_name") or "").strip()
    last_name  = (data.get("last_name")  or "").strip()
    email      = (data.get("email")      or "").strip().lower()
    password   = (data.get("password")   or "").strip()

    if not all([first_name, last_name, email, password]):
        return jsonify({"message": "All fields are required"}), 400

    if Student.query.filter_by(email=email).first():
        return jsonify({"message": "Student with that email already exists"}), 409

    # Plain text for quick testing ONLY
    new_student = Student(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password_hash=password,
    )
    db.session.add(new_student)
    db.session.commit()

    return jsonify({
        "message": "Registration successful",
        "student_id": new_student.student_id,
        "email": new_student.email
    }), 201

# ---------- Login ----------
@routes_blueprint.route("/login", methods=["POST"])
def login():
    if not request.is_json:
        return jsonify({"message": "Missing JSON data"}), 400

    data = request.get_json()
    email    = (data.get("email")    or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"message": "Missing email or password"}), 400

    student = Student.query.filter_by(email=email).first()

    # Plain text compare for dev/testing ONLY
    if student and student.password_hash == password:
        return jsonify({
            "message": "Login successful",
            "student_id": student.student_id,
            "email": student.email
        }), 200

    return jsonify({"message": "Invalid email or password"}), 401

# ---------- Debug: which DB file is used ----------
@routes_blueprint.route("/debug/dbpath", methods=["GET"], endpoint="debug_dbpath")
def debug_dbpath():
    row = db.session.execute(text("PRAGMA database_list;")).mappings().first()
    return jsonify({
        "engine_url": str(db.engine.url),
        "db_file": row.get("file", "") if row else ""
    }), 200

# ---------- Debug: list users ----------
@routes_blueprint.route("/users", methods=["GET"], endpoint="list_users")
def list_users():
    out = [
        {"id": s.student_id, "first_name": s.first_name, "last_name": s.last_name, "email": s.email}
        for s in Student.query.order_by(Student.student_id.desc()).all()
    ]
    return jsonify(out), 200
