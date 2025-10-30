from flask import Blueprint, request, jsonify, render_template
from Database.__init__ import db
from Database.models import Program

courses = Blueprint('courses', __name__)

# Render all courses page
@courses.route('/')
def course_list():
    search_query = request.args.get('search', '')
    university_filter = request.args.get('university', '')

    query = Program.query
    if search_query:
        query = query.filter(Program.program_name.ilike(f"%{search_query}%"))
    if university_filter:
        query = query.filter(Program.university_id == university_filter)

    all_courses = query.all()
    return render_template('course_management.html', courses=all_courses)


# Add new course
@courses.route('/add', methods=['POST'])
def add_course():
    data = request.get_json()
    try:
        new_course = Program(
            program_name=data['program_name'],
            description=data.get('description', ''),
            university_id=int(data['university_id']),
            duration_years=int(data.get('duration_years')),
            degree_type=data.get('degree_type')
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
        course.university_id = data['university_id']
        course.duration_years = data.get('duration_years')
        course.degree_type = data.get('degree_type')
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
            'fees': getattr(c, 'fees', '')  # if you have a fees field
        }
        for c in all_courses
    ]
    return jsonify(courses_list)
