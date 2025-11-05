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
    # --- SERVER-SIDE VALIDATION ---
    def error(msg):
        return jsonify({'message': msg}), 400

    # Academic Marks: at least 1, all required, mark 0-100, subject/grade not empty
    marks = data.get('academic_marks', [])
    if not marks or not isinstance(marks, list):
        return error('Please enter at least one subject and mark.')
    for mark in marks:
        subject_name = mark.get('subject_name')
        grade = mark.get('grade_level')
        try:
            percent = float(mark.get('grade_or_percentage', 0))
        except Exception:
            return error('Mark must be a number.')
        if not subject_name:
            return error('Subject is required.')
        if percent < 0 or percent > 100:
            return error('Mark must be between 0 and 100.')
        if not grade:
            return error('Grade is required.')

    # Preferences
    prefs = data.get('preferences', {})
    province = (prefs.get('preferred_location') or '').split(',')[0].strip()
    suburb = (prefs.get('preferred_location') or '').split(',')[1].strip() if ',' in (prefs.get('preferred_location') or '') else ''
    if not province:
        return error('Province is required.')
    if not suburb:
        return error('Suburb/area is required.')
    preferred_degrees = prefs.get('preferred_degrees', [])
    if not preferred_degrees or not isinstance(preferred_degrees, list):
        return error('At least one qualification type is required.')
    try:
        tuition = float(prefs.get('max_tuition_fee', 0))
    except Exception:
        return error('Maximum tuition fee must be a number.')
    if tuition <= 0:
        return error('Maximum tuition fee must be positive.')
    relocate = prefs.get('relocate')
    if relocate not in ('yes', 'no'):
        return error('Relocation preference is required.')
    study_mode = prefs.get('study_mode')
    if study_mode not in ('contact', 'distance', 'hybrid'):
        return error('Study mode is required.')
    need_support = prefs.get('need_support')
    if need_support not in ('yes', 'no'):
        return error('Academic support preference is required.')
    if need_support == 'yes':
        support_details = prefs.get('support_details', '')
        if not support_details or len(support_details.strip()) < 5:
            return error('Please specify the support you need (at least 5 characters).')
    career_interests = prefs.get('career_interests', [])
    if not career_interests or not isinstance(career_interests, list) or not any(career_interests):
        return error('At least one career interest is required.')
    nsfas = prefs.get('nsfas')
    if nsfas not in ('yes', 'no'):
        return error('NSFAS preference is required.')

    # --- END VALIDATION ---

    # Restore missing assignment for existing_pref
    existing_pref = Preference.query.filter_by(student_id=student_id).first()

    # ...existing code for saving marks and preferences...
    # For Academic Marks, check if a mark for the same subject already exists and update,
    # otherwise create a new record.
    for mark in marks:
        subject_name = mark.get('subject_name')
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
