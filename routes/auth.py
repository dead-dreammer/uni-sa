from flask import Blueprint, request, jsonify, session
from Database.models import *
from Database.__init__ import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask import request, render_template, flash, redirect, url_for

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
    location = data.get('location') 

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
        location=location,
        password=generate_password_hash(password)
    )
    db.session.add(new_student)
    db.session.commit()  # commit so new_student.id is available


    # Store session
    # Store session
    session['student_id'] = new_student.student_id
    session['name'] = new_student.name
    session['email'] = new_student.email
    session['number'] = new_student.number   
    session['location'] = new_student.location  
    session['dob'] = new_student.dob.strftime('%Y-%m-%d') if new_student.dob else None
    session['gender'] = new_student.gender

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

import random
from datetime import datetime, timedelta
from flask import session, request, render_template, redirect, url_for, flash

# Step 1: Forgot password form
@auth.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        user_input = request.form.get('userIdentifier')
        user = db.session.query(Student).filter((Student.email==user_input)|(Student.number==user_input)).first()
        if not user:
            flash("User not found", "error")
            return redirect(url_for('auth.forgot_password'))

        otp = str(random.randint(100000, 999999))
        session['reset_otp'] = otp
        session['reset_user'] = user.student_id
        session['otp_expiry'] = (datetime.now() + timedelta(minutes=5)).timestamp()

        # TODO: send OTP via SMS gateway
        print(f"OTP for {user_input}: {otp}")  # Testing only

        flash("OTP has been sent. Enter it below along with your new password.", "info")
        return redirect(url_for('auth.otp_reset'))

    return render_template('Login/forgot_password.html')

# Step 2: Verify OTP and reset password
@auth.route('/otp-reset', methods=['GET', 'POST'])
def otp_reset():
    if request.method == 'POST':
        otp = request.form.get('otp')
        new_password = request.form.get('newPassword')

        if 'reset_otp' not in session or 'otp_expiry' not in session:
            flash("OTP expired. Try again.", "error")
            return redirect(url_for('auth.forgot_password'))

        if datetime.now().timestamp() > session['otp_expiry']:
            session.pop('reset_otp', None)
            session.pop('reset_user', None)
            session.pop('otp_expiry', None)
            flash("OTP expired. Try again.", "error")
            return redirect(url_for('auth.forgot_password'))

        if otp != session['reset_otp']:
            flash("Invalid OTP. Try again.", "error")
            return redirect(url_for('auth.otp_reset'))

        user_id = session['reset_user']
        user = db.session.query(Student).get(user_id)
        user.password = generate_password_hash(new_password)  # Use hashing
        db.session.commit()

        session.pop('reset_otp', None)
        session.pop('reset_user', None)
        session.pop('otp_expiry', None)

        flash("Password successfully reset! Please login.", "success")
        return redirect(url_for('login'))

    return render_template('Login/otp_reset.html')

