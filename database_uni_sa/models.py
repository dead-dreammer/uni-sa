# newdatabase/models.py
from datetime import datetime
from database_uni_sa import db  # IMPORTANT: absolute import to ensure SAME db object

class Student(db.Model):
    __tablename__ = 'student'
    student_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name  = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    registration_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class AcademicMark(db.Model):
    __tablename__ = 'academic_mark'
    mark_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.student_id'), nullable=False)
    subject_name = db.Column(db.String(100), nullable=False)
    grade_or_percentage = db.Column(db.Float, nullable=False)
    grade_level = db.Column(db.String(20), default='12th Grade')

class Preference(db.Model):
    __tablename__ = 'preference'
    preference_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.student_id'), nullable=False)
    preferred_location = db.Column(db.String(100))
    preferred_degree = db.Column(db.String(50))
    max_tuition_fee = db.Column(db.Float)
    focus_area = db.Column(db.String(100))
    __table_args__ = (db.UniqueConstraint('student_id', 'focus_area', name='_student_focus_uc'),)

class University(db.Model):
    __tablename__ = 'university'
    university_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    city = db.Column(db.String(100), nullable=False)
    province_state = db.Column(db.String(100), nullable=False)

class Program(db.Model):
    __tablename__ = 'program'
    program_id = db.Column(db.Integer, primary_key=True)
    university_id = db.Column(db.Integer, db.ForeignKey('university.university_id'), nullable=False)
    program_name = db.Column(db.String(200), nullable=False)
    degree_type = db.Column(db.String(50))
    duration_years = db.Column(db.Integer)
    description = db.Column(db.Text)
    __table_args__ = (db.UniqueConstraint('university_id', 'program_name', name='_program_name_uc'),)

class Requirement(db.Model):
    __tablename__ = 'requirement'
    requirement_id = db.Column(db.Integer, primary_key=True)
    program_id = db.Column(db.Integer, db.ForeignKey('program.program_id'), nullable=False)
    required_subject = db.Column(db.String(100), nullable=False)
    min_grade_percentage = db.Column(db.Float, nullable=False)
    is_prerequisite = db.Column(db.Boolean, default=True)

class Application(db.Model):
    __tablename__ = 'application'
    application_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.student_id'), nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('program.program_id'), nullable=False)
    application_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    current_status_id = db.Column(db.Integer, db.ForeignKey('application_status.status_id'))

class ApplicationStatus(db.Model):
    __tablename__ = 'application_status'
    status_id = db.Column(db.Integer, primary_key=True)
    status_name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255))
