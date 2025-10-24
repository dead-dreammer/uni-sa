from flask import Blueprint, request, jsonify, session
from Database.models import db, AcademicMark, Preference
from datetime import datetime

search = Blueprint('search', __name__)

@search.route('/save_data', methods=['POST'])
def save_data():
    # Ensure user is logged in
    student_id = session.get('student_id')
    if not student_id:
        return jsonify({'message': 'Unauthorized. Please log in first.'}), 401

    data = request.get_json()

    # --- Save Academic Marks ---
    marks = data.get('academic_marks', [])
    for mark in marks:
        new_mark = AcademicMark(
            student_id=student_id,
            subject_name=mark['subject_name'],
            grade_or_percentage=mark['grade_or_percentage'],
            grade_level=mark.get('grade_level', '12th Grade')
        )
        db.session.add(new_mark)

    # --- Save Preferences ---
    prefs = data.get('preferences', {})
    new_pref = Preference(
        student_id=student_id,
        preferred_location=prefs.get('preferred_location'),
        preferred_degree=prefs.get('preferred_degree'),
        max_tuition_fee=prefs.get('max_tuition_fee'),
        focus_area=prefs.get('focus_area')
    )
    db.session.add(new_pref)

    db.session.commit()
    return jsonify({'message': 'Data saved successfully!'}), 201
