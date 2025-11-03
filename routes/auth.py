from flask import Blueprint, request, jsonify, session
from Database.models import *
from Database.__init__ import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

auth = Blueprint('auth', __name__)

# -------------------------
# SIGN UP
# -------------------------
@auth.post('/sign-up')
def sign_up():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    number = data.get('number')
    password = data.get('password')
    gender = data.get('gender')
    dob_str = data.get('dob')

    # Parse date of birth
    dob_obj = None
    if dob_str:
        dob_obj = datetime.strptime(dob_str, '%Y-%m-%d').date()

    # Prevent duplicate emails
    if Student.query.filter_by(email=email).first():
        return jsonify({'message': 'Account already exists with that email address'}), 400

    # Create new_student
    new_student = Student(
        email=email,
        name=name,
        number=number,
        dob=dob_obj,
        gender=gender,
        password=generate_password_hash(password)
    )
    db.session.add(new_student)
    db.session.commit()  # commit so new_student.id is available


    # Store session
    # Store session
    session['student_id'] = new_student.student_id
    session['name'] = new_student.name
    session['email'] = new_student.email
    session['number'] = new_student.number   # add this

    # calculate and store age
    if new_student.dob:
        today = datetime.today().date()
        age = today.year - new_student.dob.year - ((today.month, today.day) < (new_student.dob.month, new_student.dob.day))
        session['age'] = age
    else:
        session['age'] = None

    return jsonify({'message': 'Account Created!', 'name': new_student.name}), 201


# -------------------------
# LOGIN
# -------------------------
@auth.post('/login')
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    student = Student.query.filter_by(email=email).first()
    if not student or not check_password_hash(student.password, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    session['student_id'] = student.student_id
    session['name'] = student.name
    session['email'] = student.email
    session['number'] = student.number
    from datetime import date
 
    if student.dob:
        today = date.today()
        age = today.year - student.dob.year - ((today.month, today.day) < (student.dob.month, student.dob.day))
        session['age'] = age
    else:
        session['age'] = None


    return jsonify({'message': 'Login successful', 'name': student.name}), 200


# -------------------------
# LOGOUT
# -------------------------
@auth.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})
