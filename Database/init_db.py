import os
import sys

# Ensure project root (parent of this Database package) is on sys.path so
# absolute imports like 'from Database.__init__ import ...' work when the
# script is executed directly (python Database/init_db.py).
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from Database.__init__ import db, create_app
from Database.models import University, Program, Requirement

def init_db():
    app = create_app()
    with app.app_context():
        # Add Universities
        universities = [
            {
                'name': 'University of KwaZulu-Natal',
                'city': 'Durban',
                'province_state': 'KwaZulu-Natal'
            },
            {
                'name': 'Durban University of Technology',
                'city': 'Durban',
                'province_state': 'KwaZulu-Natal'
            },
            {
                'name': 'Mangosuthu University of Technology',
                'city': 'Durban',
                'province_state': 'KwaZulu-Natal'
            },
            {
                'name': 'University of Cape Town',
                'city': 'Cape Town',
                'province_state': 'Western Cape'
            }
        ]

        # Add universities to database
        for uni_data in universities:
            uni = University.query.filter_by(name=uni_data['name']).first()
            if not uni:
                uni = University(**uni_data)
                db.session.add(uni)
        db.session.commit()

        # Programs for UKZN
        ukzn = University.query.filter_by(name='University of KwaZulu-Natal').first()
        ukzn_programs = [
            {
                'program_name': 'Bachelor of Science in Computer Science',
                'degree_type': 'BSc',
                'duration_years': 3,
                'description': 'A comprehensive program covering programming, algorithms, and software development',
                'location': 'Westville Campus',
                'study_mode': 'Full-time',
                'requirements': [
                    {'subject': 'Mathematics', 'min_grade': 60},
                    {'subject': 'Physical Science', 'min_grade': 55},
                    {'subject': 'English', 'min_grade': 50}
                ]
            },
            {
                'program_name': 'Bachelor of Commerce in Accounting',
                'degree_type': 'BCom',
                'duration_years': 3,
                'description': 'Prepares students for careers in accounting and financial management',
                'location': 'Westville Campus',
                'study_mode': 'Full-time',
                'requirements': [
                    {'subject': 'Mathematics', 'min_grade': 55},
                    {'subject': 'English', 'min_grade': 50},
                    {'subject': 'Accounting', 'min_grade': 60}
                ]
            }
        ]

        # Add programs and requirements
        for prog_data in ukzn_programs:
            requirements = prog_data.pop('requirements')
            program = Program.query.filter_by(university_id=ukzn.university_id, program_name=prog_data['program_name']).first()
            if not program:
                program = Program(university_id=ukzn.university_id, **prog_data)
                db.session.add(program)
                db.session.commit()

                for req in requirements:
                    requirement = Requirement(
                        program_id=program.program_id,
                        required_subject=req['subject'],
                        min_grade_percentage=req['min_grade'],
                        is_prerequisite=True
                    )
                    db.session.add(requirement)

        # Programs for DUT
        dut = University.query.filter_by(name='Durban University of Technology').first()
        dut_programs = [
            {
                'program_name': 'Diploma in Information Technology',
                'degree_type': 'Diploma',
                'duration_years': 3,
                'description': 'Practical IT program focusing on software development and systems analysis',
                'location': 'ML Sultan Campus',
                'study_mode': 'Full-time',
                'requirements': [
                    {'subject': 'Mathematics', 'min_grade': 50},
                    {'subject': 'English', 'min_grade': 50}
                ]
            },
            {
                'program_name': 'National Diploma in Civil Engineering',
                'degree_type': 'Diploma',
                'duration_years': 3,
                'description': 'Hands-on program in civil engineering principles and practices',
                'location': 'Steve Biko Campus',
                'study_mode': 'Full-time',
                'requirements': [
                    {'subject': 'Mathematics', 'min_grade': 55},
                    {'subject': 'Physical Science', 'min_grade': 55},
                    {'subject': 'English', 'min_grade': 50}
                ]
            }
        ]

        # Add DUT programs and requirements
        for prog_data in dut_programs:
            requirements = prog_data.pop('requirements')
            program = Program.query.filter_by(university_id=dut.university_id, program_name=prog_data['program_name']).first()
            if not program:
                program = Program(university_id=dut.university_id, **prog_data)
                db.session.add(program)
                db.session.commit()

                for req in requirements:
                    requirement = Requirement(
                        program_id=program.program_id,
                        required_subject=req['subject'],
                        min_grade_percentage=req['min_grade'],
                        is_prerequisite=True
                    )
                    db.session.add(requirement)

        db.session.commit()

if __name__ == '__main__':
    init_db()