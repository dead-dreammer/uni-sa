import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from Database.__init__ import db, create_app
from Database.models import University, Program, Requirement

def init_db():
    app = create_app()
    with app.app_context():
        # === Define all universities and programs here ===
        universities_data = [
            {
                'name': 'University of KwaZulu-Natal',
                'city': 'Durban',
                'province_state': 'KwaZulu-Natal',
                'programs': [
                    {
                        'program_name': 'Bachelor of Science in Computer Science',
                        'degree_type': 'BSc',
                        'duration_years': 3,
                        'description': 'Covers programming, algorithms, and software engineering.',
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
                        'description': 'Prepares students for careers in accounting and financial management.',
                        'location': 'Westville Campus',
                        'study_mode': 'Full-time',
                        'requirements': [
                            {'subject': 'Mathematics', 'min_grade': 55},
                            {'subject': 'English', 'min_grade': 50},
                            {'subject': 'Accounting', 'min_grade': 60}
                        ]
                    },
                    {
                        'program_name': 'Bachelor of Social Science in Psychology',
                        'degree_type': 'BSocSci',
                        'duration_years': 3,
                        'description': 'Focuses on human behavior, development, and social interaction.',
                        'location': 'Howard College',
                        'study_mode': 'Full-time',
                        'requirements': [
                            {'subject': 'English', 'min_grade': 55},
                            {'subject': 'Life Sciences', 'min_grade': 50},
                            {'subject': 'Mathematics', 'min_grade': 45}
                        ]
                    }
                ]
            },
            {
                'name': 'Durban University of Technology',
                'city': 'Durban',
                'province_state': 'KwaZulu-Natal',
                'programs': [
                    {
                        'program_name': 'Diploma in Information Technology',
                        'degree_type': 'Diploma',
                        'duration_years': 3,
                        'description': 'Focuses on software development and systems analysis.',
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
                        'description': 'Hands-on program in civil engineering principles and practices.',
                        'location': 'Steve Biko Campus',
                        'study_mode': 'Full-time',
                        'requirements': [
                            {'subject': 'Mathematics', 'min_grade': 55},
                            {'subject': 'Physical Science', 'min_grade': 55},
                            {'subject': 'English', 'min_grade': 50}
                        ]
                    },
                    {
                        'program_name': 'Diploma in Graphic Design',
                        'degree_type': 'Diploma',
                        'duration_years': 3,
                        'description': 'Teaches design principles, digital art, and creative branding.',
                        'location': 'City Campus',
                        'study_mode': 'Full-time',
                        'requirements': [
                            {'subject': 'English', 'min_grade': 50},
                            {'subject': 'Visual Arts', 'min_grade': 55}
                        ]
                    }
                ]
            },
            {
                'name': 'University of Cape Town',
                'city': 'Cape Town',
                'province_state': 'Western Cape',
                'programs': [
                    {
                        'program_name': 'Bachelor of Medicine and Surgery',
                        'degree_type': 'MBChB',
                        'duration_years': 6,
                        'description': 'Comprehensive medical program for aspiring doctors.',
                        'location': 'Groote Schuur Campus',
                        'study_mode': 'Full-time',
                        'requirements': [
                            {'subject': 'Mathematics', 'min_grade': 70},
                            {'subject': 'Physical Science', 'min_grade': 70},
                            {'subject': 'Life Sciences', 'min_grade': 65},
                            {'subject': 'English', 'min_grade': 60}
                        ]
                    },
                    {
                        'program_name': 'Bachelor of Laws',
                        'degree_type': 'LLB',
                        'duration_years': 4,
                        'description': 'Covers legal theory, practice, and research.',
                        'location': 'Upper Campus',
                        'study_mode': 'Full-time',
                        'requirements': [
                            {'subject': 'English', 'min_grade': 60},
                            {'subject': 'History', 'min_grade': 55},
                            {'subject': 'Mathematics', 'min_grade': 45}
                        ]
                    }
                ]
            }
        ]

        # === Insert into DB ===
        for uni_data in universities_data:
            uni = University.query.filter_by(name=uni_data['name']).first()
            if not uni:
                uni = University(
                    name=uni_data['name'],
                    city=uni_data['city'],
                    province_state=uni_data['province_state']
                )
                db.session.add(uni)
                db.session.commit()

            for prog_data in uni_data['programs']:
                requirements = prog_data.pop('requirements')
                program = Program.query.filter_by(university_id=uni.university_id, program_name=prog_data['program_name']).first()
                if not program:
                    program = Program(university_id=uni.university_id, **prog_data)
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
        print("✅ Database seeded successfully!")

if __name__ == '__main__':
    init_db()
