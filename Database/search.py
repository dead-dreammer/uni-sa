from flask import Blueprint, request, jsonify, session
from Database.models import db, AcademicMark, Preference
import json

search = Blueprint('search', __name__)

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
# For Academic Marks, you could check if a mark for the same subject already exists:
    for mark in marks:
        existing_mark = AcademicMark.query.filter_by(student_id=student_id, subject_name=mark['subject_name']).first()
        if existing_mark:
            existing_mark.grade_or_percentage = mark['grade_or_percentage']
            existing_mark.grade_level = mark.get('grade_level', '12th Grade')
    else:
        new_mark = AcademicMark(
            student_id=student_id,
            subject_name=mark['subject_name'],
            grade_or_percentage=mark['grade_or_percentage'],
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

@search.route('/get_data', methods=['GET'])
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

    prefs = {}
    if student_pref:
        prefs = {
            "preferred_location": student_pref.preferred_location,
            "preferred_degrees": json.loads(student_pref.preferred_degrees or "[]"),
            "max_tuition_fee": student_pref.max_tuition_fee,
            "focus_area": student_pref.focus_area,
            "relocate": student_pref.relocate,
            "study_mode": student_pref.study_mode,
            "need_support": student_pref.need_support,
            "support_details": student_pref.support_details,
            "career_interests": json.loads(student_pref.career_interests or "[]"),
            "nsfas": student_pref.nsfas
        }

    return jsonify({"academic_marks": marks, "preferences": prefs})

