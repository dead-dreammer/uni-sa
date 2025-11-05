from flask import Blueprint, request, jsonify
from datetime import datetime
from Database.models import db, Admission
import json

admissions_bp = Blueprint('admissions', __name__)

# Helper: only accept priority values we expect
def normalize_priority(value):
    if not value:
        return 'Medium'
    v = str(value).strip().capitalize()
    return v if v in ('High', 'Medium', 'Low') else 'Medium'

# Helper: safe parse ISO date string -> date
def parse_iso_date(s):
    if not s:
        return None
    try:
        # datetime.fromisoformat supports 'YYYY-MM-DD' or full ISO
        return datetime.fromisoformat(s)
    except Exception:
        # last-resort: try slicing to date-only, ignore timezones
        try:
            return datetime.strptime(s.split('T')[0], '%Y-%m-%d')
        except Exception:
            return None

# Helper: returns set of column names on Admission table
def admission_columns():
    return set(c.name for c in Admission.__table__.columns)

# Get all admissions
@admissions_bp.route('/api/admissions', methods=['GET'])
def get_admissions():
    try:
        admissions = Admission.query.all()
        admissions_list = []
        cols = admission_columns()
        
        for admission in admissions:
            # use getattr with defaults to avoid AttributeError if column missing
            admissions_list.append({
                'id': getattr(admission, 'admission_id', None),
                'title': getattr(admission, 'title', ''),
                'institution': getattr(admission, 'institution', ''),
                'institutionType': getattr(admission, 'institution_type', ''),
                'programName': getattr(admission, 'program_name', ''),
                'applicationDeadline': getattr(admission, 'application_deadline').isoformat() if getattr(admission, 'application_deadline', None) else None,
                'registrationDeadline': getattr(admission, 'registration_deadline').isoformat() if getattr(admission, 'registration_deadline', None) else None,
                'academicYear': getattr(admission, 'academic_year', ''),
                'intakePeriod': getattr(admission, 'intake_period', ''),
                'fieldOfStudy': getattr(admission, 'field_of_study', ''),
                'studyLevel': getattr(admission, 'study_level', ''),
                'studyMode': getattr(admission, 'study_mode', ''),
                'description': getattr(admission, 'description', ''),
                'requirements': json.loads(getattr(admission, 'requirements')) if getattr(admission, 'requirements', None) else [],
                'applicationFee': getattr(admission, 'application_fee', ''),
                'tuitionFee': getattr(admission, 'tuition_fee', ''),
                'url': getattr(admission, 'url', ''),
                'applicationPortalUrl': getattr(admission, 'application_portal_url', ''),
                'contactEmail': getattr(admission, 'contact_email', ''),
                'contactPhone': getattr(admission, 'contact_phone', ''),
                'tags': json.loads(getattr(admission, 'tags')) if getattr(admission, 'tags', None) else [],
                # priority may not exist in DB; use fallback
                'priority': getattr(admission, 'priority', 'Medium')
            })
        
        return jsonify(admissions_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Create new admission
@admissions_bp.route('/api/admissions', methods=['POST'])
def create_admission():
    try:
        data = request.json or {}
        cols = admission_columns()

        # Build kwargs only for columns that exist in the table
        kwargs = {}

        if 'title' in cols:
            kwargs['title'] = data.get('title')
        if 'institution' in cols:
            kwargs['institution'] = data.get('institution')
        if 'institution_type' in cols:
            kwargs['institution_type'] = data.get('institutionType')
        if 'program_name' in cols:
            kwargs['program_name'] = data.get('programName')
        if 'application_deadline' in cols:
            kwargs['application_deadline'] = parse_iso_date(data.get('applicationDeadline'))
        if 'registration_deadline' in cols:
            kwargs['registration_deadline'] = parse_iso_date(data.get('registrationDeadline'))
        if 'academic_year' in cols:
            kwargs['academic_year'] = data.get('academicYear')
        if 'intake_period' in cols:
            kwargs['intake_period'] = data.get('intakePeriod')
        if 'field_of_study' in cols:
            kwargs['field_of_study'] = data.get('fieldOfStudy')
        if 'study_level' in cols:
            kwargs['study_level'] = data.get('studyLevel')
        if 'study_mode' in cols:
            kwargs['study_mode'] = data.get('studyMode')
        if 'description' in cols:
            kwargs['description'] = data.get('description')
        if 'requirements' in cols:
            kwargs['requirements'] = json.dumps(data.get('requirements', []))
        if 'application_fee' in cols:
            kwargs['application_fee'] = data.get('applicationFee')
        if 'tuition_fee' in cols:
            kwargs['tuition_fee'] = data.get('tuitionFee')
        if 'url' in cols:
            kwargs['url'] = data.get('url')
        if 'application_portal_url' in cols:
            kwargs['application_portal_url'] = data.get('applicationPortalUrl')
        if 'contact_email' in cols:
            kwargs['contact_email'] = data.get('contactEmail')
        if 'contact_phone' in cols:
            kwargs['contact_phone'] = data.get('contactPhone')
        if 'tags' in cols:
            kwargs['tags'] = json.dumps(data.get('tags', []))
        if 'priority' in cols:
            kwargs['priority'] = normalize_priority(data.get('priority'))

        new_admission = Admission(**kwargs)
        
        db.session.add(new_admission)
        db.session.commit()
        
        return jsonify({'success': True, 'id': getattr(new_admission, 'admission_id', None)})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Update admission
@admissions_bp.route('/api/admissions/<int:admission_id>', methods=['PUT'])
def update_admission(admission_id):
    try:
        admission = Admission.query.get(admission_id)
        if not admission:
            return jsonify({'success': False, 'error': 'Admission not found'}), 404
        
        data = request.json or {}
        cols = admission_columns()

        if 'title' in cols and 'title' in data:
            admission.title = data.get('title', admission.title)
        if 'institution' in cols and 'institution' in data:
            admission.institution = data.get('institution', admission.institution)
        if 'institution_type' in cols and 'institutionType' in data:
            admission.institution_type = data.get('institutionType', admission.institution_type)
        if 'program_name' in cols and 'programName' in data:
            admission.program_name = data.get('programName', admission.program_name)
        if 'application_deadline' in cols and 'applicationDeadline' in data:
            parsed = parse_iso_date(data.get('applicationDeadline'))
            if parsed is not None:
                admission.application_deadline = parsed
        if 'registration_deadline' in cols and 'registrationDeadline' in data:
            parsed = parse_iso_date(data.get('registrationDeadline'))
            if parsed is not None:
                admission.registration_deadline = parsed
        if 'academic_year' in cols and 'academicYear' in data:
            admission.academic_year = data.get('academicYear', admission.academic_year)
        if 'intake_period' in cols and 'intakePeriod' in data:
            admission.intake_period = data.get('intakePeriod', admission.intake_period)
        if 'field_of_study' in cols and 'fieldOfStudy' in data:
            admission.field_of_study = data.get('fieldOfStudy', admission.field_of_study)
        if 'study_level' in cols and 'studyLevel' in data:
            admission.study_level = data.get('studyLevel', admission.study_level)
        if 'study_mode' in cols and 'studyMode' in data:
            admission.study_mode = data.get('studyMode', admission.study_mode)
        if 'description' in cols and 'description' in data:
            admission.description = data.get('description', admission.description)
        if 'requirements' in cols and 'requirements' in data:
            admission.requirements = json.dumps(data.get('requirements', []))
        if 'application_fee' in cols and 'applicationFee' in data:
            admission.application_fee = data.get('applicationFee', admission.application_fee)
        if 'tuition_fee' in cols and 'tuitionFee' in data:
            admission.tuition_fee = data.get('tuitionFee', admission.tuition_fee)
        if 'url' in cols and 'url' in data:
            admission.url = data.get('url', admission.url)
        if 'application_portal_url' in cols and 'applicationPortalUrl' in data:
            admission.application_portal_url = data.get('applicationPortalUrl', admission.application_portal_url)
        if 'contact_email' in cols and 'contactEmail' in data:
            admission.contact_email = data.get('contactEmail', admission.contact_email)
        if 'contact_phone' in cols and 'contactPhone' in data:
            admission.contact_phone = data.get('contactPhone', admission.contact_phone)
        if 'tags' in cols and 'tags' in data:
            admission.tags = json.dumps(data.get('tags', []))
        if 'priority' in cols and 'priority' in data:
            admission.priority = normalize_priority(data.get('priority'))
        
        admission.updated_at = datetime.utcnow() if 'updated_at' in cols else getattr(admission, 'updated_at', None)
        
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Delete admission
@admissions_bp.route('/api/admissions/<int:admission_id>', methods=['DELETE'])
def delete_admission(admission_id):
    try:
        admission = Admission.query.get(admission_id)
        if not admission:
            return jsonify({'success': False, 'error': 'Admission not found'}), 404
        
        db.session.delete(admission)
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500