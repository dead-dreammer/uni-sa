from flask import Blueprint, request, jsonify, render_template, session, url_for, send_file
from Database.__init__ import db
from Database.models import Program, Student, Preference, AcademicMark, Requirement, University, Report, LikedCourse
import json
from weasyprint import HTML
import tempfile
import os
from datetime import datetime
import shutil

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

@courses.route('/matches', methods=['GET', 'POST'])
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
        'max_tuition_fee': preferences.max_tuition_fee,
        'study_mode': (preferences.study_mode or '').lower(),
        'focus_area': preferences.focus_area,
        'relocate': (preferences.relocate or '').lower() == 'yes',
        'nsfas': (preferences.nsfas or '').lower() == 'yes',
        'preferred_degrees': json.loads(preferences.preferred_degrees or '[]')
    }

    # Convert marks to dict for easy lookup
    marks_dict = {mark.subject_name: mark.grade_or_percentage for mark in academic_marks}
    # Create a list of (subject_name, grade) for fuzzy matching
    marks_items = list(marks_dict.items())

    def normalize_subject(name: str) -> str:
        if not name:
            return ''
        # lower, remove non-word characters, collapse spaces
        return re.sub(r"\W+", ' ', name).strip().lower()

    def find_best_mark(req_subject: str):
        """Try to find the student's grade for a requirement subject.

        Strategy:
        - exact match
        - normalized exact match
        - substring match (req in mark or mark in req)
        - token overlap (choose best overlap)
        Returns a float grade or None if not found.
        """
        if not req_subject:
            return None
        # exact
        if req_subject in marks_dict:
            return marks_dict[req_subject]

        req_norm = normalize_subject(req_subject)
        # normalized exact
        for s, g in marks_items:
            if normalize_subject(s) == req_norm:
                return g

        # substring
        for s, g in marks_items:
            s_norm = normalize_subject(s)
            if req_norm in s_norm or s_norm in req_norm:
                return g

        # token overlap score
        req_tokens = set(req_norm.split())
        best_score = 0.0
        best_grade = None
        for s, g in marks_items:
            s_tokens = set(normalize_subject(s).split())
            if not s_tokens or not req_tokens:
                continue
            inter = req_tokens.intersection(s_tokens)
            score = len(inter) / max(len(req_tokens), 1)
            if score > best_score:
                best_score = score
                best_grade = g

        # require at least 0.4 overlap to accept
        if best_score >= 0.4:
            return best_grade

        return None

    # Query programs (we'll do looser filtering in Python to avoid strict DB mismatches)
    potential_programs = Program.query.join(University).all()

    # Filter by max tuition fee if set
    max_fee = None
    if pref_dict.get('max_tuition_fee'):
        try:
            max_fee = float(pref_dict['max_tuition_fee'])
        except Exception:
            max_fee = None

    if max_fee is not None:
        def parse_fee(fee):
            if not fee:
                return None
            fee_str = str(fee).replace(',', '').replace('R', '').replace(' ', '')
            try:
                return float(fee_str)
            except Exception:
                return None
        potential_programs = [p for p in potential_programs if parse_fee(getattr(p, 'fees', None)) is not None and parse_fee(getattr(p, 'fees', None)) <= max_fee]

    # Scoring helpers
    from collections import Counter
    import re, math
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

        # Compute requirement satisfaction ratio (0..1) and requirement met status
        req_met_count = 0
        reqs_with_status = []
        for r in requirements:
            # Try to map the requirement subject to a student mark using fuzzy matching
            student_grade = find_best_mark(r.required_subject)
            if student_grade is None:
                student_grade = 0
            met = student_grade >= r.min_grade_percentage
            reqs_with_status.append({
                'required_subject': r.required_subject,
                'min_grade_percentage': r.min_grade_percentage,
                'is_prerequisite': getattr(r, 'is_prerequisite', True),
                'student_grade': student_grade,
                'met': met
            })
            if met:
                req_met_count += 1
        req_ratio = req_met_count / len(requirements) if requirements else 1.0

        # Optional debug: if DEBUG_MATCHER=1, print programs where none of the
        # requirements matched any student marks to help troubleshooting subject name mismatches.
        if os.getenv('DEBUG_MATCHER') == '1' and requirements:
            any_scores = any((req['student_grade'] and req['student_grade'] > 0) for req in reqs_with_status)
            if not any_scores:
                print(f"[MATCHER DEBUG] Program '{program.program_name}' has requirements but no matching student marks.")
                print("  Requirements:", [r['required_subject'] for r in reqs_with_status])
                print("  Student marks:", marks_items)

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
                student_mark = find_best_mark(req.required_subject)
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
                'fees': getattr(program, 'fees', ''),
                'requirements': reqs_with_status
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


# Liked courses endpoints
@courses.route('/liked-courses', methods=['GET'])
def get_liked_courses():
    student_id = session.get('student_id')
    if not student_id:
        # Return 401 for unauthenticated requests so client can decide whether to
        # use localStorage fallback instead of overwriting it.
        return jsonify({'error': 'Not logged in'}), 401
    liked = LikedCourse.query.filter_by(student_id=student_id).all()
    return jsonify([l.program_id for l in liked])


@courses.route('/save_liked_course', methods=['POST'])
def save_liked_course():
    student_id = session.get('student_id')
    if not student_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
    data = request.get_json() or {}
    program_id = data.get('course_id') or data.get('program_id')
    if not program_id:
        return jsonify({'success': False, 'error': 'Missing course_id'}), 400

    # ensure program exists
    program = Program.query.get(program_id)
    if not program:
        return jsonify({'success': False, 'error': 'Program not found'}), 404

    existing = LikedCourse.query.filter_by(student_id=student_id, program_id=program_id).first()
    if existing:
        return jsonify({'success': True, 'already': True})

    try:
        like = LikedCourse(student_id=student_id, program_id=program_id)
        db.session.add(like)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@courses.route('/remove_liked_course', methods=['POST'])
def remove_liked_course():
    student_id = session.get('student_id')
    if not student_id:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401
    data = request.get_json() or {}
    program_id = data.get('course_id') or data.get('program_id')
    if not program_id:
        return jsonify({'success': False, 'error': 'Missing course_id'}), 400

    existing = LikedCourse.query.filter_by(student_id=student_id, program_id=program_id).first()
    if not existing:
        return jsonify({'success': True, 'removed': False})
    try:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'success': True, 'removed': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


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
            fees=data.get('fees', ''),
            location=data.get('location', ''),
            study_mode=data.get('study_mode', '')
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
        course.fees = data.get('fees', '')
        course.location = data.get('location', '')
        course.study_mode = data.get('study_mode', '')
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
    all_courses = Program.query.join(University).all()  # Join University table
    courses_list = [
        {
            'id': c.program_id,
            'title': c.program_name,
            'description': c.description,
            'college': c.university.name if c.university else 'N/A',
            'duration': c.duration_years,
            'degree_type': c.degree_type,
            'fees': c.fees or '',
            'location': c.location or '',
            'study_mode': c.study_mode or ''
        }
        for c in all_courses
    ]
    return jsonify(courses_list)


# report generation
@courses.route('/download-report')
def download_report():
    """Generate and download a PDF report of course matches and save it to disk/DB.

    - If request is AJAX/fetch (Accept: application/json or X-Requested-With header), returns JSON:
      { success: True, report: { id, title, filename, created_at }, download_url: '/reports/<id>/download' }
    - Otherwise returns the PDF directly (legacy behavior).
    """
    student_id = session.get('student_id')
    if not student_id:
        return jsonify({'error': 'Not logged in'}), 401

    # Compute matches
    matches, student_obj, pref_dict, marks_dict = compute_matches(student_id)
    if matches is None:
        # If AJAX, return JSON error; else return JSON too (existing behavior uses JSON)
        if 'application/json' in request.headers.get('Accept', '') or request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.args.get('ajax') == '1':
            return jsonify({'error': 'Missing preferences or academic marks'}), 400
        return jsonify({'error': 'Missing preferences or academic marks'}), 400

    student = Student.query.get(student_id)

    # Render the report HTML and create a temporary PDF
    rendered_html = render_template('Reports/course_report.html',
                                    student=student,
                                    matches=matches,
                                    preferences=pref_dict,
                                    marks=marks_dict,
                                    now=datetime.now())

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as pdf_file:
        HTML(string=rendered_html).write_pdf(pdf_file.name)

    # Build stable filename and save copy to persistent folder
    student_name = (student.name.replace(' ', '_') if student and getattr(student, 'name', None) else 'Student')
    filename = f"{student_name}_Course_Matches_Report_{int(datetime.utcnow().timestamp())}.pdf"

    base_reports_dir = os.path.join(os.path.dirname(__file__), 'uploads', 'reports')
    os.makedirs(base_reports_dir, exist_ok=True)
    student_dir = os.path.join(base_reports_dir, str(student_id))
    os.makedirs(student_dir, exist_ok=True)

    dest_path = os.path.join(student_dir, filename)
    saved_report = None
    try:
        shutil.copy(pdf_file.name, dest_path)

        # create DB record (ensure Report is imported at top of file)
        new_report = Report(
            student_id=student_id,
            title="Course Matches Report",
            filename=filename,
            created_at=datetime.utcnow()
        )
        db.session.add(new_report)
        db.session.commit()
        saved_report = new_report
    except Exception as e:
        print("Error saving report:", e)
        db.session.rollback()

    # Detect AJAX / fetch call
    accept = request.headers.get('Accept', '')
    is_ajax = 'application/json' in accept or request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.args.get('ajax') == '1'

    if is_ajax:
        if saved_report:
            download_url = url_for('reports.download_saved_report', report_id=saved_report.report_id)
            return jsonify({
                'success': True,
                'report': {
                    'id': saved_report.report_id,
                    'title': saved_report.title,
                    'filename': saved_report.filename,
                    'created_at': saved_report.created_at.isoformat()
                },
                'download_url': download_url
            })
        else:
            return jsonify({'success': False, 'error': 'Could not save report on server.'}), 500

    # Non-AJAX: return the generated PDF (legacy)
    return send_file(
        pdf_file.name,
        as_attachment=True,
        download_name=filename,
        mimetype='application/pdf'
    )