import os
import sys
import json
from datetime import datetime

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from Database.__init__ import db, create_app
from Database.models import Bursary

def init_bursaries():
    app = create_app()
    with app.app_context():

        # === Define bursaries ===
        bursaries_data = [
    {
        'title': 'ABC Science Scholarship',
        'provider': 'ABC Foundation',
        'provider_type': 'Private',
        'amount': 50000,
        'deadline': '2025-12-31',
        'field_of_study': 'Science',
        'study_level': 'Undergraduate',
        'description': 'Scholarship for top science students.',
        'requirements': [{'subject': 'Mathematics', 'min_grade': 70}, {'subject': 'Physical Science', 'min_grade': 65}],
        'coverage': 'Tuition and books',
        'url': 'https://abcfoundation.org/scholarship',
        'tags': ['science', 'merit']
    },
    {
        'title': 'XYZ Engineering Bursary',
        'provider': 'XYZ Corp',
        'provider_type': 'Corporate',
        'amount': 40000,
        'deadline': '2025-11-30',
        'field_of_study': 'Engineering',
        'study_level': 'Undergraduate',
        'description': 'Supporting engineering students with financial aid.',
        'requirements': [{'subject': 'Mathematics', 'min_grade': 65}, {'subject': 'Physical Science', 'min_grade': 60}],
        'coverage': 'Tuition',
        'url': 'https://xyzcorp.com/bursaries',
        'tags': ['engineering', 'corporate']
    },
    {
        'title': 'Global Health Bursary',
        'provider': 'Global Aid',
        'provider_type': 'NGO',
        'amount': 30000,
        'deadline': '2025-10-15',
        'field_of_study': 'Health Sciences',
        'study_level': 'Undergraduate',
        'description': 'Bursary for students pursuing health-related fields.',
        'requirements': [{'subject': 'Biology', 'min_grade': 60}],
        'coverage': 'Tuition and accommodation',
        'url': 'https://globalaid.org/health-bursary',
        'tags': ['health', 'merit']
    },
    {
        'title': 'Creative Arts Grant',
        'provider': 'Arts Council',
        'provider_type': 'Government',
        'amount': 25000,
        'deadline': '2025-09-30',
        'field_of_study': 'Arts',
        'study_level': 'Undergraduate',
        'description': 'Grant for students studying performing or visual arts.',
        'requirements': [{'subject': 'Visual Arts', 'min_grade': 55}],
        'coverage': 'Tuition, materials',
        'url': 'https://artscouncil.gov/grants',
        'tags': ['arts', 'creativity']
    },
    {
        'title': 'Tech Innovators Bursary',
        'provider': 'TechFuture',
        'provider_type': 'Corporate',
        'amount': 45000,
        'deadline': '2025-11-15',
        'field_of_study': 'Information Technology',
        'study_level': 'Undergraduate',
        'description': 'Bursary for IT students demonstrating innovation skills.',
        'requirements': [{'subject': 'Mathematics', 'min_grade': 65}, {'subject': 'Computer Science', 'min_grade': 60}],
        'coverage': 'Tuition',
        'url': 'https://techfuture.com/bursaries',
        'tags': ['technology', 'innovation']
    },
    {
        'title': 'Finance Leaders Scholarship',
        'provider': 'Finance Trust',
        'provider_type': 'Private',
        'amount': 35000,
        'deadline': '2025-12-01',
        'field_of_study': 'Finance',
        'study_level': 'Undergraduate',
        'description': 'Supports students pursuing degrees in finance and accounting.',
        'requirements': [{'subject': 'Mathematics', 'min_grade': 60}, {'subject': 'Accounting', 'min_grade': 65}],
        'coverage': 'Tuition and mentorship',
        'url': 'https://financetrust.org/scholarship',
        'tags': ['finance', 'merit']
    },
    {
        'title': 'Women in STEM Bursary',
        'provider': 'STEM Empowerment',
        'provider_type': 'NGO',
        'amount': 40000,
        'deadline': '2025-10-31',
        'field_of_study': 'STEM',
        'study_level': 'Undergraduate',
        'description': 'Promotes female participation in STEM fields.',
        'requirements': [{'subject': 'Mathematics', 'min_grade': 65}, {'subject': 'Physics', 'min_grade': 60}],
        'coverage': 'Tuition and conference attendance',
        'url': 'https://stemempowerment.org/bursary',
        'tags': ['STEM', 'women']
    },
    {
        'title': 'Law Excellence Award',
        'provider': 'Legal Aid Foundation',
        'provider_type': 'NGO',
        'amount': 30000,
        'deadline': '2025-09-20',
        'field_of_study': 'Law',
        'study_level': 'Undergraduate',
        'description': 'Award for top-performing law students.',
        'requirements': [{'subject': 'English', 'min_grade': 65}],
        'coverage': 'Tuition and legal resources',
        'url': 'https://legalaidfoundation.org/law-award',
        'tags': ['law', 'merit']
    },
    {
        'title': 'Environmental Studies Bursary',
        'provider': 'Green Future',
        'provider_type': 'NGO',
        'amount': 25000,
        'deadline': '2025-11-10',
        'field_of_study': 'Environmental Science',
        'study_level': 'Undergraduate',
        'description': 'Bursary for students focusing on sustainability and environment.',
        'requirements': [{'subject': 'Biology', 'min_grade': 60}],
        'coverage': 'Tuition and research costs',
        'url': 'https://greenfuture.org/bursary',
        'tags': ['environment', 'sustainability']
    },
    {
        'title': 'Medical Scholars Grant',
        'provider': 'HealthCare Trust',
        'provider_type': 'Private',
        'amount': 50000,
        'deadline': '2025-12-15',
        'field_of_study': 'Medicine',
        'study_level': 'Undergraduate',
        'description': 'Supports students pursuing medical degrees.',
        'requirements': [{'subject': 'Biology', 'min_grade': 70}, {'subject': 'Physical Science', 'min_grade': 65}],
        'coverage': 'Tuition, accommodation',
        'url': 'https://healthcaretrust.org/medical-grant',
        'tags': ['medicine', 'merit']
    },

    # … Continue generating similar entries up to 50 total bursaries
]

            # Add more bursaries here (can generate 50+ similarly)


        # === Insert into DB ===
        for b_data in bursaries_data:
            bursary = Bursary.query.filter_by(title=b_data['title'], provider=b_data['provider']).first()
            if not bursary:
                deadline = datetime.strptime(b_data['deadline'], '%Y-%m-%d').date() if b_data.get('deadline') else None
                new_bursary = Bursary(
                    title=b_data['title'],
                    provider=b_data['provider'],
                    provider_type=b_data['provider_type'],
                    amount=b_data['amount'],
                    deadline=deadline,
                    field_of_study=b_data['field_of_study'],
                    study_level=b_data['study_level'],
                    description=b_data['description'],
                    requirements=json.dumps(b_data.get('requirements', [])),
                    coverage=b_data['coverage'],
                    url=b_data.get('url'),
                    tags=json.dumps(b_data.get('tags', []))
                )
                db.session.add(new_bursary)

        db.session.commit()
        print("✅ Bursaries seeded successfully!")

if __name__ == '__main__':
    init_bursaries()
