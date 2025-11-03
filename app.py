from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file
from Database.auth import auth
from Database.search import search
from Database.courses import courses
from Database.bursary import bursary
from Database.backup import backup_database
from Database.__init__ import db, create_database, create_app
from Database.models import Student, Preference, AcademicMark, Program, University, Requirement, Bursary
from Chatbot.bot import chatbot_response
from Database.backup import backup_database, restore_latest_backup
#from weasyprint import HTML
#import tempfile
import json

app = create_app()



@app.after_request
def add_header(response):
    # Prevent caching during development
    response.headers["Cache-Control"] = "no-store"
    return response


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


@app.route('/course-management')
def course_management():
    return render_template('Admin/course_management.html')

@app.route('/bursary-management')
def bursary_management():
    return render_template('Admin/bursary_management.html')

@app.route('/admissions-calendar-management')
def admissions_calendar_management():
    return render_template('Admin/admissions_calendar_management.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    # Combined login/signup page
    return render_template('Login/login_signup.html')


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

@app.route('/profile')
def profile():
    return render_template('profile.html')


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
def start_search():
    return render_template('Search/start_my_search.html')


@app.route('/save_data', methods=['POST', 'GET'])
def personal_info():
    return render_template('Search/personal_info.html')

@app.route('/matching-page')
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

'''
@app.route('/generate_report', methods=['POST'])
def generate_report():
    """Generate PDF report from search form data"""
    
    try:
        # Get student info from session
        student_id = session.get('student_id')
        if not student_id:
            return jsonify({"error": "Not logged in"}), 401
        
        student = db.session.get(Student, student_id)
        student_name = f"{student.first_name} {student.last_name}" if student else "Student"
        
        # Extract form data - handle both FormData and JSON
        if request.is_json:
            data = request.get_json()
            get_value = lambda key: data.get(key)
            get_list = lambda key: data.get(key, [])
        else:
            get_value = lambda key: request.form.get(key)
            get_list = lambda key: request.form.getlist(key)
        
        # Process subjects and calculate average
        subjects_data = []
        subject_names = get_list('subject')
        subject_marks = get_list('mark')
        subject_grades = get_list('grade')
        
        total_marks = 0
        subject_count = 0
        
        for i in range(len(subject_names)):
            if subject_names[i] and subject_marks[i]:
                mark = int(subject_marks[i])
                subjects_data.append({
                    'subject': subject_names[i].replace('-', ' ').title(),
                    'mark': mark,
                    'grade': subject_grades[i] if i < len(subject_grades) else ''
                })
                total_marks += mark
                subject_count += 1
        
        avg_grades = round(total_marks / subject_count, 1) if subject_count > 0 else 0
        
        # Location data
        province = get_value('province') or ''
        suburb = get_value('suburb') or ''
        location = f"{suburb.title()}, {province.replace('-', ' ').title()}" if suburb and province else province.replace('-', ' ').title()
        
        # Other preferences
        relocate = get_value('relocate') == 'yes'
        study_mode = get_value('studyMode') or ''
        max_tuition = get_value('max_tuition_fee') or ''
        nsfas = get_value('nsfas') == 'yes'
        
        # Get selected qualifications
        preferred_degrees = get_list('preferred_degree')
        
        # Get career interests
        career_interests = []
        for i in range(1, 4):
            career = get_value(f'career_{i}')
            if career:
                career_interests.append(career.replace('-', ' ').title())
        
        # Support needs
        need_support = get_value('needSupport') == 'yes'
        support_details = get_value('supportDetails') or '' if need_support else ''
        
        # Determine budget status
        if nsfas:
            budget_status = "NSFAS Applicant"
        elif max_tuition:
            try:
                budget_status = f"Self-Funded (Max: R{int(max_tuition):,})"
            except:
                budget_status = f"Self-Funded (Max: R{max_tuition})"
        else:
            budget_status = "Self-Funded"
        
        # Format interests from career selections
        interests = ", ".join(career_interests) if career_interests else "Various Fields"
        
        # Fetch matched colleges from database
        colleges = fetch_matched_colleges_from_db(
            avg_grades=avg_grades,
            subjects=subjects_data,
            province=province,
            relocate=relocate,
            study_mode=study_mode,
            max_tuition=max_tuition,
            qualifications=preferred_degrees,
            careers=career_interests,
            nsfas=nsfas
        )
        
        # Render HTML with collected data
        rendered_html = render_template('report_template.html',
                                        student_name=student_name,
                                        avg_grades=avg_grades,
                                        interests=interests,
                                        location=location,
                                        budget_status=budget_status,
                                        colleges=colleges,
                                        num_options=len(colleges),
                                        study_mode=study_mode.replace('-', ' ').title(),
                                        subjects=subjects_data)
        
        # Create temp PDF file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as pdf_file:
            HTML(string=rendered_html).write_pdf(pdf_file.name)
            return send_file(pdf_file.name, 
                           as_attachment=True, 
                           download_name=f"Your_Step_Forward_Report_{student_name.replace(' ', '_')}.pdf",
                           mimetype='application/pdf')
    
    except Exception as e:
        print(f"Error generating report: {e}")
        return jsonify({"error": str(e)}), 500


def fetch_matched_colleges_from_db(avg_grades, subjects, province, relocate, 
                                   study_mode, max_tuition, qualifications, 
                                   careers, nsfas):
    """
    Fetch matched colleges from your database using your existing matching logic
    """
    
    colleges_list = []
    
    # Query programs with universities
    programs = Program.query.join(University).all()
    
    for program in programs:
        university = program.university
        
        # Filter by location if not willing to relocate
        if not relocate and province:
            if university.province_state.lower() != province.lower():
                continue
        
        # Filter by study mode
        if study_mode and program.study_mode.lower() != study_mode.lower():
            continue
        
        # Filter by NSFAS
        if nsfas and not university.nsfas_accredited:
            continue
        
        # Filter by max tuition
        if max_tuition:
            try:
                max_fee = float(max_tuition)
                if program.tuition_fee_per_year and program.tuition_fee_per_year > max_fee:
                    continue
            except:
                pass
        
        # Check requirements
        requirements = Requirement.query.filter_by(program_id=program.program_id).all()
        meets_requirements = True
        missing_subjects = []
        
        for req in requirements:
            student_has_subject = False
            for subj in subjects:
                if req.required_subject.lower() in subj['subject'].lower():
                    if subj['mark'] >= req.min_grade_percentage:
                        student_has_subject = True
                        break
            
            if not student_has_subject:
                meets_requirements = False
                missing_subjects.append(req.required_subject)
        
        # Calculate match score
        match_score = 100
        
        if not meets_requirements:
            match_score -= 30
        
        if relocate and province and university.province_state.lower() != province.lower():
            match_score -= 15
        
        if program.degree_type in qualifications:
            match_score += 20
        
        # Determine match level
        if match_score >= 85:
            match_level = "Strong Match"
        elif match_score >= 70:
            match_level = "Good Match"
        else:
            match_level = "Consider This Option"
        
        # Build benefits list
        benefits = []
        if meets_requirements:
            benefits.append("You meet the entry requirements!")
        else:
            benefits.append(f"Additional subjects needed: {', '.join(missing_subjects)}")
        
        if not relocate and university.province_state.lower() == province.lower():
            benefits.append("Close to home - easy commute")
        
        if program.tuition_fee_per_year:
            if program.tuition_fee_per_year < 20000:
                benefits.append("Affordable fees - within most budgets")
            elif program.tuition_fee_per_year < 40000:
                benefits.append("Moderate fees")
        
        if university.nsfas_accredited:
            benefits.append("NSFAS accredited institution")
        
        # Format college data
        college_data = {
            'name': university.university_name,
            'match_level': match_level,
            'program': program.program_name,
            'location': f"{university.city}, {university.province_state}",
            'cost': f"R{program.tuition_fee_per_year:,.0f}/year" if program.tuition_fee_per_year else "Contact for fees",
            'duration': program.duration or "Contact institution",
            'mode': program.study_mode.title() if program.study_mode else "Contact",
            'benefits': benefits if benefits else ["Contact institution for details"],
            'career_path': program.career_outcomes or "Various career paths available",
            'contact': university.contact_number or "Contact via website",
            'email': university.email or "See website",
            'website': university.website or "www.uni.sa",
            'deadline': program.application_deadline or "Check university website"
        }
        
        colleges_list.append({
            'data': college_data,
            'score': match_score
        })
    
    # Sort by match score
    colleges_list.sort(key=lambda x: x['score'], reverse=True)
    
    # Return top 5 matches
    return [c['data'] for c in colleges_list[:5]]
'''

@app.route('/admissions')
def admissions():
    return render_template('Student Tools/admissions.html')


@app.route('/bursaries')
def bursaries():
    return render_template('Student Tools/bursaries.html')


@app.route('/terms')
def terms():
    return render_template('terms.html')


@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/admin')
def admin():
    return render_template('Admin/admin.html')

@app.route('/courses/add', methods=['GET', 'POST'])
def add_course_page():
    return render_template('Admin/admin.html')


if __name__ == '__main__':
    # Runs the Flask development server
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)