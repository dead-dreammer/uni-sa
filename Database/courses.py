from flask import Blueprint, request, jsonify, render_template, session
from Database.__init__ import db
from Database.models import Program, Student, Preference, AcademicMark, Requirement, University
import json

courses = Blueprint('courses', __name__)

# Course Management Routes
@courses.route('/manage')
def manage_courses():
    # Get all universities for the dropdown
    universities = University.query.all()
    
    # Get all courses with their university information
    courses = db.session.query(Program, University)\
        .join(University)\
        .order_by(University.name, Program.program_name)\
        .all()

    # Convert to a format suitable for the template
    course_list = []
    for program, university in courses:
        requirements = Requirement.query.filter_by(program_id=program.program_id).all()
        course_list.append({
            'id': program.program_id,
            'title': program.program_name,
            'description': program.description,
            'college': university.name,
            'college_id': university.university_id,
            'duration': f"{program.duration_years} years",
            'degree_type': program.degree_type,
            'location': program.location,
            'study_mode': program.study_mode,
            'requirements': requirements
        })

    return render_template('Admin/course_management.html', 
                         courses=course_list,
                         universities=universities)


# NOTE: earlier versions had a second set of REST endpoints here which caused
# duplicate endpoint names (e.g. two `add_course` functions). The admin
# endpoints used by the UI are implemented below (add/edit/delete with
# distinct URLs). Keeping a single set avoids Flask endpoint collisions.

@courses.route('/matches')
def get_matches():
    # Delegate to shared matcher function
    student_id = session.get('student_id')
    if not student_id:
        return jsonify({'error': 'Not logged in'}), 401

    matches, student_obj, pref_dict, marks_dict = compute_matches(student_id)
    if matches is None:
        return jsonify({'error': 'Missing preferences or academic marks'}), 400

    return render_template('Search/matching_page.html', 
                         matches=matches,
                         preferences=pref_dict,
                         marks=marks_dict)


def compute_matches(student_id):
    """Compute and return a list of matching program dicts for the given student_id.
    Returns (matches, student_obj, pref_dict, marks_dict) or (None, None, None, None)
    if the student doesn't have sufficient data.
    """
    # Get student preferences
    preferences = Preference.query.filter_by(student_id=student_id).first()
    academic_marks = AcademicMark.query.filter_by(student_id=student_id).all()
    student_obj = Student.query.get(student_id)

    if not preferences or not academic_marks:
        return (None, None, None, None)

    # Convert preferences
    raw_location = (preferences.preferred_location or '')
    province = raw_location.split(',')[0].strip() if raw_location else ''
    pref_dict = {
        'location': province.lower(),
        'max_fee': preferences.max_tuition_fee,
        'study_mode': (preferences.study_mode or '').lower(),
        'focus_area': preferences.focus_area,
        'relocate': (preferences.relocate or '').lower() == 'yes',
        'nsfas': (preferences.nsfas or '').lower() == 'yes',
        'preferred_degrees': json.loads(preferences.preferred_degrees or '[]')
    }

    # Convert marks to dict for easy lookup
    marks_dict = {mark.subject_name: mark.grade_or_percentage for mark in academic_marks}

    # Query programs (we'll do looser filtering in Python to avoid strict DB mismatches)
    potential_programs = Program.query.join(University).all()

    # Scoring helpers
    from collections import Counter
    import math
    import re

    def tokenize(text):
        if not text:
            return []
        return [t for t in re.findall(r"\w+", text.lower()) if len(t) > 1]

    def vectorize_counter(tokens):
        return Counter(tokens)

    def cosine_sim(c1, c2):
        if not c1 or not c2:
            return 0.0
        dot = 0
        for k, v in c1.items():
            dot += v * c2.get(k, 0)
        norm1 = math.sqrt(sum(v * v for v in c1.values()))
        norm2 = math.sqrt(sum(v * v for v in c2.values()))
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot / (norm1 * norm2)

    # Build student text profile
    student_text_parts = []
    if preferences.focus_area:
        student_text_parts.append(preferences.focus_area)
    if preferences.preferred_degrees:
        try:
            student_text_parts.extend(json.loads(preferences.preferred_degrees or '[]'))
        except Exception:
            pass
    try:
        student_text_parts.extend(json.loads(preferences.career_interests or '[]'))
    except Exception:
        pass
    student_text = ' '.join([str(p) for p in student_text_parts if p])
    student_tokens = tokenize(student_text)
    student_vec = vectorize_counter(student_tokens)

    matches = []
    for program in potential_programs:
        requirements = Requirement.query.filter_by(program_id=program.program_id).all()

        # Compute requirement satisfaction ratio (0..1)
        if requirements:
            satisfied = 0
            for req in requirements:
                student_mark = marks_dict.get(req.required_subject)
                if student_mark is not None and student_mark >= req.min_grade_percentage:
                    satisfied += 1
            req_ratio = satisfied / len(requirements)
        else:
            req_ratio = 1.0

        # Text similarity
        program_text = ' '.join(filter(None, [program.program_name, program.description, program.degree_type, program.location]))
        prog_tokens = tokenize(program_text)
        prog_vec = vectorize_counter(prog_tokens)
        text_sim = cosine_sim(student_vec, prog_vec)

        # Degree match
        degree_match = 0.0
        if program.degree_type:
            for d in pref_dict.get('preferred_degrees', []):
                try:
                    if program.degree_type.lower() == str(d).lower():
                        degree_match = 1.0
                        break
                except Exception:
                    continue

        # Study mode match
        study_mode_match = 1.0 if pref_dict.get('study_mode') and program.study_mode and pref_dict.get('study_mode').lower() in (program.study_mode or '').lower() else 0.0

        # Location handling
        location_bonus = 0.0
        prog_state = (program.university.province_state or '').lower() if program.university else ''
        if pref_dict.get('relocate'):
            if prog_state and prog_state != pref_dict.get('location'):
                location_bonus = -0.05
        else:
            if prog_state and prog_state != pref_dict.get('location'):
                continue

        # Surplus score
        surplus_score = 0.0
        if requirements:
            total_surplus = 0.0
            counted = 0
            for req in requirements:
                student_mark = marks_dict.get(req.required_subject)
                if student_mark is not None:
                    surplus = max(0.0, (student_mark - req.min_grade_percentage) / max(1.0, req.min_grade_percentage))
                    total_surplus += surplus
                    counted += 1
            if counted:
                surplus_score = total_surplus / counted

        score = (
            0.45 * req_ratio +
            0.30 * text_sim +
            0.10 * degree_match +
            0.10 * study_mode_match +
            0.05 * surplus_score +
            location_bonus
        )
        raw_score = max(0.0, min(1.0, score)) * 100

        # Build a nested structure so templates can access program and university attributes
        matches.append({
            'program': {
                'program_id': program.program_id,
                'program_name': program.program_name,
                'description': program.description,
                'degree_type': program.degree_type,
                'duration_years': getattr(program, 'duration_years', None),
                'location': getattr(program, 'location', ''),
                'study_mode': getattr(program, 'study_mode', ''),
                # requirements as objects with the same field names templates expect
                'requirements': [
                    {
                        'required_subject': r.required_subject,
                        'min_grade_percentage': r.min_grade_percentage,
                        'is_prerequisite': getattr(r, 'is_prerequisite', True)
                    }
                    for r in requirements
                ]
            },
            'university': {
                'name': program.university.name if program.university else '',
                'province_state': program.university.province_state if program.university else ''
            },
            'location': program.location,
            'study_mode': program.study_mode,
            'degree_type': program.degree_type,
            'match_score': int(round(raw_score)),
            'req_ratio': req_ratio,
            'text_sim': round(text_sim, 3)
        })

    matches.sort(key=lambda x: x['match_score'], reverse=True)
    return (matches, student_obj, pref_dict, marks_dict)


@courses.route('/debug_matches')
def debug_matches():
    student_id = session.get('student_id')
    if not student_id:
        return jsonify({'error': 'Not logged in'}), 401
    matches, student_obj, pref_dict, marks_dict = compute_matches(student_id)
    if matches is None:
        return jsonify({'error': 'Missing preferences or academic marks'}), 400
    return jsonify({'matches': matches, 'preferences': pref_dict, 'marks': marks_dict})


# Add new course
@courses.route('/add', methods=['POST'])
def add_course():
    data = request.get_json()
    try:
        new_course = Program(
            program_name=data['program_name'],
            description=data.get('description', ''),
            university_id=int(data['university_id']),
            duration_years=int(data.get('duration_years', 0)),
            degree_type=data.get('degree_type'),
            location=data.get('location', ''),        # NEW
            study_mode=data.get('study_mode', '')     # NEW
        )
        db.session.add(new_course)
        db.session.commit()
        return jsonify({'success': True, 'course_id': new_course.program_id})
    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})


# Edit existing course
@courses.route('/edit/<int:course_id>', methods=['POST'])
def edit_course(course_id):
    course = Program.query.get(course_id)
    if not course:
        return jsonify({'success': False, 'error': 'Course not found'})
    try:
        data = request.get_json()
        course.program_name = data['program_name']
        course.description = data.get('description', '')
        course.university_id = int(data['university_id'])
        course.duration_years = int(data.get('duration_years', 0))
        course.degree_type = data.get('degree_type')
        course.location = data.get('location', '')          # NEW
        course.study_mode = data.get('study_mode', '')     # NEW
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})


# Delete course
@courses.route('/delete/<int:course_id>', methods=['POST'])
def delete_course(course_id):
    course = Program.query.get(course_id)
    if not course:
        return jsonify({'success': False, 'error': 'Course not found'})
    try:
        db.session.delete(course)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        print(e)
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})


# Return all courses as JSON
@courses.route('/all', methods=['GET'])
def get_all_courses():
    all_courses = Program.query.all()
    courses_list = [
        {
            'id': c.program_id,
            'title': c.program_name,
            'description': c.description,
            'college': c.university_id if c.university else '',
            'duration': c.duration_years,
            'degree_type': c.degree_type,
            'fees': getattr(c, 'fees', ''),
            'location': getattr(c, 'location', ''),          # NEW
            'study_mode': getattr(c, 'study_mode', '')       # NEW
        }
        for c in all_courses
    ]
    return jsonify(courses_list)
