from flask import Blueprint, request, jsonify, session, render_template, redirect, url_for
from Database.models import db, AcademicMark, Preference, Student
import json

search = Blueprint('search', __name__)

@search.route('/start')
def start_search():
    student_id = session.get('student_id')
    if not student_id:
        return redirect(url_for('auth.login'))
    return render_template('Search/start_my_search.html')

@search.route('/save_data', methods=['POST'])
def save_data():
    student_id = session.get('student_id')
    if not student_id:
        return jsonify({'message': 'Unauthorized. Please log in first.'}), 401

    data = request.get_json()

    # ------------------------------
    # Save Academic Marks
    # ------------------------------
    marks = data.get('academic_marks', [])
    # For Academic Marks, check if a mark for the same subject already exists and update,
    # otherwise create a new record.
    for mark in marks:
        subject_name = mark.get('subject_name')
        if not subject_name:
            continue
        existing_mark = AcademicMark.query.filter_by(student_id=student_id, subject_name=subject_name).first()
        if existing_mark:
            try:
                existing_mark.grade_or_percentage = float(mark.get('grade_or_percentage', existing_mark.grade_or_percentage))
            except Exception:
                existing_mark.grade_or_percentage = existing_mark.grade_or_percentage
            existing_mark.grade_level = mark.get('grade_level', existing_mark.grade_level or '12th Grade')
        else:
            try:
                grade_val = float(mark.get('grade_or_percentage', 0))
            except Exception:
                grade_val = 0
            new_mark = AcademicMark(
                student_id=student_id,
                subject_name=subject_name,
                grade_or_percentage=grade_val,
                grade_level=mark.get('grade_level', '12th Grade')
            )
            db.session.add(new_mark)


    # ------------------------------
    # Save Preferences
    # ------------------------------
    prefs = data.get('preferences', {})
    existing_pref = Preference.query.filter_by(student_id=student_id).first()

    # preferred_degrees is already an array
    preferred_degrees = prefs.get('preferred_degrees', [])

    if existing_pref:
        existing_pref.preferred_location = prefs.get('preferred_location')
        existing_pref.preferred_degrees = json.dumps(preferred_degrees)
        existing_pref.max_tuition_fee = prefs.get('max_tuition_fee')
        existing_pref.focus_area = prefs.get('focus_area')
        existing_pref.relocate = prefs.get('relocate')
        existing_pref.study_mode = prefs.get('study_mode')
        existing_pref.need_support = prefs.get('need_support')
        existing_pref.support_details = prefs.get('support_details')
        existing_pref.career_interests = json.dumps(prefs.get('career_interests', []))
        existing_pref.nsfas = prefs.get('nsfas')
    else:
        new_pref = Preference(
            student_id=student_id,
            preferred_location=prefs.get('preferred_location'),
            preferred_degrees=json.dumps(preferred_degrees),
            max_tuition_fee=prefs.get('max_tuition_fee'),
            focus_area=prefs.get('focus_area'),
            relocate=prefs.get('relocate'),
            study_mode=prefs.get('study_mode'),
            need_support=prefs.get('need_support'),
            support_details=prefs.get('support_details'),
            career_interests=json.dumps(prefs.get('career_interests', [])),
            nsfas=prefs.get('nsfas')
        )
        db.session.add(new_pref)

    db.session.commit()
    return jsonify({'message': 'Data saved successfully!'}), 201

@search.route('/get_student_data', methods=['GET'])
def get_data():
    student_id = session.get('student_id')
    if not student_id:
        return jsonify({'message': 'Unauthorized'}), 401

    student_pref = Preference.query.filter_by(student_id=student_id).first()
    academic_marks = AcademicMark.query.filter_by(student_id=student_id).all()

    marks = [
        {
            "subject_name": m.subject_name,
            "grade_or_percentage": m.grade_or_percentage,
            "grade_level": m.grade_level
        } for m in academic_marks
    ]

    # Return a preferences object with safe defaults to keep the frontend simple
    prefs = {
        "preferred_location": "",
        "preferred_degrees": [],
        "max_tuition_fee": None,
        "focus_area": "",
        "relocate": "",
        "study_mode": "",
        "need_support": "",
        "support_details": "",
        "career_interests": [],
        "nsfas": ""
    }
    if student_pref:
        prefs = {
            "preferred_location": student_pref.preferred_location or "",
            "preferred_degrees": json.loads(student_pref.preferred_degrees or "[]"),
            "max_tuition_fee": student_pref.max_tuition_fee,
            "focus_area": student_pref.focus_area or "",
            "relocate": student_pref.relocate or "",
            "study_mode": student_pref.study_mode or "",
            "need_support": student_pref.need_support or "",
            "support_details": student_pref.support_details or "",
            "career_interests": json.loads(student_pref.career_interests or "[]"),
            "nsfas": student_pref.nsfas or ""
        }

    # Also include basic student profile fields if available
    student = None
    try:
        student_obj = Student.query.get(student_id)
        if student_obj:
            student = {
                'student_id': student_obj.student_id,
                'name': student_obj.name,
                'email': student_obj.email,
                'number': student_obj.number,
                'dob': student_obj.dob.isoformat() if getattr(student_obj, 'dob', None) else None,
                'gender': student_obj.gender
            }
    except Exception:
        student = None

    return jsonify({"academic_marks": marks, "preferences": prefs, "student": student})

courses = [
    {
        "id": "coastal-tvet",
        "name": "National Certificate (Vocational) in Finance, Economics, & Accounting",
        "institution": "Coastal KZN TVET College",
        "location": "Verulam Campus",
        "mode": "contact",
        "min_fee": 5000,
        "max_fee": 8000,
        "career_paths": ["bookkeeper", "accounting-clerk", "junior-accountant"],
    },
    # DUT, INTEC, etc...
]

@search.route('/find_matches', methods=['POST'])
def find_matches():
    student_info = request.form.to_dict(flat=False)
    # Example: extract subjects, max fee, preferred study mode
    subjects = student_info.get("subject[]", [])
    max_fee = int(student_info.get("max_tuition_fee", [0])[0])
    study_mode = student_info.get("studyMode", ["contact"])[0]

    # Filter courses based on max fee and study mode
    filtered_courses = []
    for course in courses:
        if course['mode'] == study_mode and course['max_fee'] <= max_fee:
            filtered_courses.append(course)
    
    # Pass filtered courses to matches template
    return render_template("matches.html", courses=filtered_courses, student_info=student_info)


