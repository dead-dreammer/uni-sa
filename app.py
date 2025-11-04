from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file
from routes.auth import auth
from routes.search import search
from routes.courses import courses
from routes.bursary import bursary
from Database.backup import backup_database
from Database.__init__ import db, create_database, create_app
from Database.models import Student, Preference, AcademicMark, Program, University, Requirement, Bursary
from Chatbot.bot import chatbot_response
from Database.backup import backup_database, restore_latest_backup
#from weasyprint import HTML
#import tempfile
import json
from functools import wraps

app = create_app()

# --- Routes for template pages ---
@app.route('/')
@app.route('/home')
def home_page():
    # root serves the main home page (template under templates/home/home_pg.html)
    return render_template('home/home_pg.html')


@app.route('/about')
def about():
    return render_template('About Us/about_us.html')


@app.route('/how-it-works')
def how_it_works():
    return render_template('how_it_works.html')


@app.route('/contact')
def contact():
    return render_template('Contact us/contact_us.html')

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('is_admin'):
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('name'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


@app.route('/course-management')
@admin_required
def course_management():
    return render_template('Admin/course_management.html')

@app.route('/bursary-management')
@admin_required
def bursary_management():
    return render_template('Admin/bursary_management.html')

@app.route('/admissions-calendar-management')
@admin_required
def admissions_calendar_management():
    return render_template('Admin/admissions_calendar_management.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    # Combined login/signup page
    return render_template('Login/login_signup.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home_page'))


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    # same template contains signup UI
    return render_template('Login/login_signup.html')

# Admin login route
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        # Accept JSON if Content-Type is application/json
        if request.is_json:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
        else:
            email = request.form.get('email')
            password = request.form.get('password')
        
        if email == 'admin@uni.sa' and password == 'admin123':  # CHANGE THESE CREDENTIALS!
            session['is_admin'] = True
            session['admin_email'] = email
            return jsonify({"success": True})  # Respond to JS
        else:
            return jsonify({"success": False, "error": "Invalid admin credentials"})
    
    return render_template('Login/admin_login.html')


@app.route('/admin/logout')
def admin_logout():
    session.pop('is_admin', None)
    session.pop('admin_email', None)
    return redirect(url_for('home_page'))


@app.route('/ask', methods=['POST'])
def ask():
    user_message = request.json.get("message", "").strip().lower()
    if not request.is_json:
        return jsonify({"reply": "Invalid request"}), 400

    # Exit/Goodbye handling
    exit_words = ["exit", "quit", "bye", "done", "goodbye", "stop"]
    if user_message in exit_words:
        reply = "Goodbye! 👋 Have a great day ahead!"
    else:
        try:
            reply = chatbot_response(user_message)
        except Exception as e:
            reply = f"Something unexpected happened ({e}). Please try again."

    return jsonify({"reply": reply})

@app.route('/start-search')
@login_required
def start_search():
    return render_template('Search/start_my_search.html')

@app.route('/save_data', methods=['POST', 'GET'])
@login_required
def personal_info():
    return render_template('Search/personal_info.html')

@app.route('/matching-page')
@login_required
def matching_page():
    student_id = session.get('student_id')
    if not student_id:
        return redirect(url_for('auth.login'))

    # Get student preferences and marks
    preferences = Preference.query.filter_by(student_id=student_id).first()
    academic_marks = AcademicMark.query.filter_by(student_id=student_id).all()
    student = db.session.get(Student, student_id)

    if not preferences or not academic_marks:
        return redirect(url_for('search.start_search'))

    # Convert preferences to dict
    pref_dict = {
        'location': preferences.preferred_location,
        'focus_area': preferences.focus_area,
        'relocate': preferences.relocate == 'yes',
        'nsfas': preferences.nsfas == 'yes',
        'study_mode': preferences.study_mode,
        'preferred_degrees': json.loads(preferences.preferred_degrees or '[]')
    }

    # Convert marks to dict
    marks_dict = {mark.subject_name: mark.grade_or_percentage for mark in academic_marks}

    # Query matching programs
    matching_programs = []
    programs = Program.query.join(University).all()

    for program in programs:
        # Check location preference
        if not pref_dict['relocate'] and program.university.province_state != pref_dict['location']:
            continue

        # Check study mode preference
        if pref_dict['study_mode'] and program.study_mode != pref_dict['study_mode']:
            continue

        # Check requirements
        requirements = Requirement.query.filter_by(program_id=program.program_id).all()
        meets_requirements = True
        
        for req in requirements:
            student_mark = marks_dict.get(req.required_subject)
            if not student_mark or student_mark < req.min_grade_percentage:
                meets_requirements = False
                break

        if meets_requirements:
            # Calculate match score
            score = 100

            # Location score
            if pref_dict['relocate'] and program.university.province_state != pref_dict['location']:
                score -= 10

            # Degree type score
            if program.degree_type in pref_dict['preferred_degrees']:
                score += 15

            matching_programs.append({
                'program': program,
                'university': program.university,
                'match_score': score
            })

    # Sort by match score
    matching_programs.sort(key=lambda x: x['match_score'], reverse=True)

    return render_template('Search/matching_page.html',
                         matches=matching_programs,
                         preferences=pref_dict,
                         marks=marks_dict)

@app.route('/admissions')
def admissions():
    return render_template('Student Tools/admissions.html')


@app.route('/bursaries')
def bursaries():
    return render_template('Student Tools/bursaries.html')


@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')


@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/admin')
def admin():
    return render_template('Admin/admin.html')

@app.route('/courses/add', methods=['GET', 'POST'])
def add_course_page():
    return render_template('Admin/admin.html')

@app.route('/bursaries/add', methods=['GET', 'POST'])
def add_bursary_page():
    return render_template('Admin/admin.html')




if __name__ == '__main__':
    # Runs the Flask development server
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)