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
        "program": {
            "program_id": "coastal-tvet-fin",
            "program_name": "National Certificate (Vocational) in Finance, Economics, & Accounting",
            "location": "Verulam Campus",
            "duration_years": 3,
            "study_mode": "contact",
            "requirements": [
                {"required_subject": "Mathematics", "min_grade_percentage": 50},
                {"required_subject": "English", "min_grade_percentage": 50}
            ]
        },
        "university": {
            "name": "Coastal KZN TVET College",
            "province_state": "kwazulu-natal"
        },
        "match_score": 85,
        "min_fee": 5000,
        "max_fee": 8000,
        "career_paths": ["bookkeeper", "accounting-clerk", "junior-accountant"]
    },
    {
        "program": {
            "program_id": "dut-acc",
            "program_name": "Diploma in Accounting",
            "location": "Durban",
            "duration_years": 3,
            "study_mode": "contact",
            "requirements": [
                {"required_subject": "Mathematics", "min_grade_percentage": 60},
                {"required_subject": "English", "min_grade_percentage": 55},
                {"required_subject": "Accounting", "min_grade_percentage": 60}
            ]
        },
        "university": {
            "name": "Durban University of Technology",
            "province_state": "kwazulu-natal"
        },
        "match_score": 75,
        "min_fee": 25000,
        "max_fee": 35000,
        "career_paths": ["accountant", "financial-manager", "auditor"]
    }
]

@search.route('/find_matches', methods=['POST'])
def find_matches():
    student_info = request.form.to_dict(flat=False)
    
    # Prepare preferences dictionary
    preferences = {
        'study_mode': student_info.get("studyMode", ["contact"])[0],
        'max_tuition_fee': int(student_info.get("max_tuition_fee", [0])[0]),
        'relocate': student_info.get("relocate", ["no"])[0],
        'location': f"{student_info.get('province', [''])[0]}, {student_info.get('suburb', [''])[0]}".strip(', '),
        'need_support': student_info.get("needSupport", ["no"])[0],
        'support_details': student_info.get("supportDetails", [""])[0],
        'nsfas': student_info.get("nsfas", ["no"])[0],
        'preferred_degrees': student_info.get("preferred_degree", []),
        'career_interests': [career for career in student_info.get("career[]", []) if career],
        'focus_area': ""  # This can be derived from career interests if needed
    }

    # Extract academic marks
    academic_marks = []
    subjects = student_info.get("subject[]", [])
    marks = student_info.get("mark[]", [])
    grades = student_info.get("grade[]", [])
    
    for i in range(min(len(subjects), len(marks), len(grades))):
        if subjects[i]:  # Only add if subject is not empty
            academic_marks.append({
                'subject': subjects[i],
                'mark': marks[i],
                'grade': grades[i]
            })

    # Create marks dictionary for easy lookup
    marks = {mark['subject']: float(mark['mark']) for mark in academic_marks}
    
    # Filter and score matches
    matches = []
    for course in courses:
        # Basic filtering criteria
        if (course['program']['study_mode'] == preferences['study_mode'] and 
            course['max_fee'] <= preferences['max_tuition_fee']):
            
            # Location filtering
            if (preferences['relocate'] == 'yes' or 
                course['university']['province_state'].lower() in preferences['location'].lower()):
                
                # Calculate match score
                total_requirements = len(course['program']['requirements'])
                met_requirements = 0
                
                for req in course['program']['requirements']:
                    student_mark = marks.get(req['required_subject'], 0)
                    if student_mark >= req['min_grade_percentage']:
                        met_requirements += 1
                
                # Update match score based on requirements met
                if total_requirements > 0:
                    course['match_score'] = (met_requirements / total_requirements) * 100
                
                matches.append(course)
    
    # Sort matches by match score
    matches.sort(key=lambda x: x['match_score'], reverse=True)
    
    return render_template(
        "Search/matching_page.html",
        matches=matches,
        preferences=preferences,
        marks=marks,
        student_info=student_info
    )


