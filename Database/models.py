from Database.__init__ import db
from datetime import datetime
import json

class Student(db.Model):
    __tablename__ = "student"
    student_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    number = db.Column(db.String(15))
    dob = db.Column(db.Date)
    gender = db.Column(db.String(10))
    password = db.Column(db.String(200), nullable=False)

    academic_marks = db.relationship('AcademicMark', backref='student', lazy=True)
    preferences = db.relationship('Preference', backref='student', lazy=True)
    applications = db.relationship('Application', backref='student', lazy=True)


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
    preferred_degrees = db.Column(db.Text)  # JSON array of selected degrees
    max_tuition_fee = db.Column(db.Float)
    focus_area = db.Column(db.String(100))
    relocate = db.Column(db.String(10))          # yes/no
    study_mode = db.Column(db.String(20))        # contact/distance
    need_support = db.Column(db.String(10))      # yes/no
    support_details = db.Column(db.Text)
    career_interests = db.Column(db.Text)        # JSON string
    nsfas = db.Column(db.String(10))
    __table_args__ = (db.UniqueConstraint('student_id', 'focus_area', name='_student_focus_uc'),)


class University(db.Model):
    __tablename__ = 'university'
    university_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    city = db.Column(db.String(100), nullable=False)
    province_state = db.Column(db.String(100), nullable=False)
    programs = db.relationship('Program', backref='university', lazy=True)


class Program(db.Model):
    __tablename__ = 'program'
    program_id = db.Column(db.Integer, primary_key=True)
    university_id = db.Column(db.Integer, db.ForeignKey('university.university_id'), nullable=False)
    program_name = db.Column(db.String(200), nullable=False)
    degree_type = db.Column(db.String(50))
    duration_years = db.Column(db.Integer)
    description = db.Column(db.Text)
    location = db.Column(db.String(100))        # NEW
    study_mode = db.Column(db.String(20))      # NEW
    __table_args__ = (db.UniqueConstraint('university_id', 'program_name', name='_program_name_uc'),)
    requirements = db.relationship('Requirement', backref='program', lazy=True)
    applications = db.relationship('Application', backref='program', lazy=True)


class Requirement(db.Model):
    __tablename__ = 'requirement'
    requirement_id = db.Column(db.Integer, primary_key=True)
    program_id = db.Column(db.Integer, db.ForeignKey('program.program_id'), nullable=False)
    required_subject = db.Column(db.String(100), nullable=False)
    min_grade_percentage = db.Column(db.Float, nullable=False)
    is_prerequisite = db.Column(db.Boolean, default=True)


class Bursary(db.Model):
    __tablename__ = 'bursary'
    bursary_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    provider = db.Column(db.String(200), nullable=False)
    provider_type = db.Column(db.String(50))  # government, corporate, ngo, university
    amount = db.Column(db.String(100))
    deadline = db.Column(db.Date)
    field_of_study = db.Column(db.String(100))
    study_level = db.Column(db.String(50))
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)  # Store as JSON array
    coverage = db.Column(db.Text)
    url = db.Column(db.String(500))
    tags = db.Column(db.Text)  # Store as JSON array
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
class Admission(db.Model):
    __tablename__ = 'admission'
    admission_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    institution = db.Column(db.String(200), nullable=False)
    institution_type = db.Column(db.String(50))  # university, college, tvet, private
    program_name = db.Column(db.String(200))
    application_deadline = db.Column(db.Date)
    registration_deadline = db.Column(db.Date)
    academic_year = db.Column(db.String(20))  # e.g., "2025", "2025/2026"
    intake_period = db.Column(db.String(50))  # first_semester, second_semester, quarterly
    field_of_study = db.Column(db.String(100))
    study_level = db.Column(db.String(50))  # undergraduate, postgraduate, diploma, certificate
    study_mode = db.Column(db.String(50))  # full_time, part_time, distance, online
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)  # Store as JSON array - min qualifications, documents needed
    application_fee = db.Column(db.String(100))
    tuition_fee = db.Column(db.String(100))
    url = db.Column(db.String(500))
    application_portal_url = db.Column(db.String(500))
    contact_email = db.Column(db.String(200))
    contact_phone = db.Column(db.String(50))
    tags = db.Column(db.Text)  # Store as JSON array
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
class Report(db.Model):
    __tablename__ = 'report'
    report_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.student_id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    filename = db.Column(db.String(512), nullable=False)  # filename stored on disk (relative)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('Student', backref=db.backref('reports', lazy=True))

    def to_dict(self):
        return {
            'id': self.report_id,
            'student_id': self.student_id,
            'title': self.title,
            'filename': self.filename,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Application(db.Model):
    __tablename__ = 'application'
    application_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.student_id'), nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('program.program_id'), nullable=False)
    application_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class WSUniversity(db.Model):
    __tablename__ = 'ws_university'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False, unique=True)
    location = db.Column(db.String(100))
    website = db.Column(db.String(200))

    # Corrected relationship
    programs = db.relationship('WSProgram', backref='ws_university', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f"<WSUniversity {self.name}>"

class WSProgram(db.Model):
    __tablename__ = 'ws_program'
    id = db.Column(db.Integer, primary_key=True)
    program_name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    duration_years = db.Column(db.Integer)
    degree_type = db.Column(db.String(50))
    location = db.Column(db.String(100))
    study_mode = db.Column(db.String(50))
    fees = db.Column(db.String(50))

    university_id = db.Column(db.Integer, db.ForeignKey('ws_university.id'), nullable=False)

    def __repr__(self):
        return f"<WSProgram {self.program_name} at University ID {self.university_id}>"
