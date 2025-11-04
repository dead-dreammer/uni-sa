from flask import Blueprint, request, jsonify
from datetime import datetime
from Database.models import db, Admission  # Using the Admission model we created earlier
import json

admissions_bp = Blueprint('admissions', __name__)

# Get all admissions
@admissions_bp.route('/api/admissions', methods=['GET'])
def get_admissions():
    try:
        admissions = Admission.query.all()
        admissions_list = []
        
        for admission in admissions:
            admissions_list.append({
                'id': admission.admission_id,
                'title': admission.title,
                'institution': admission.institution,
                'institutionType': admission.institution_type,
                'programName': admission.program_name,
                'applicationDeadline': admission.application_deadline.isoformat() if admission.application_deadline else None,
                'registrationDeadline': admission.registration_deadline.isoformat() if admission.registration_deadline else None,
                'academicYear': admission.academic_year,
                'intakePeriod': admission.intake_period,
                'fieldOfStudy': admission.field_of_study,
                'studyLevel': admission.study_level,
                'studyMode': admission.study_mode,
                'description': admission.description,
                'requirements': json.loads(admission.requirements) if admission.requirements else [],
                'applicationFee': admission.application_fee,
                'tuitionFee': admission.tuition_fee,
                'url': admission.url,
                'applicationPortalUrl': admission.application_portal_url,
                'contactEmail': admission.contact_email,
                'contactPhone': admission.contact_phone,
                'tags': json.loads(admission.tags) if admission.tags else []
            })
        
        return jsonify(admissions_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Create new admission
@admissions_bp.route('/api/admissions', methods=['POST'])
def create_admission():
    try:
        data = request.json
        
        new_admission = Admission(
            title=data.get('title'),
            institution=data.get('institution'),
            institution_type=data.get('institutionType'),
            program_name=data.get('programName'),
            application_deadline=datetime.fromisoformat(data.get('applicationDeadline')) if data.get('applicationDeadline') else None,
            registration_deadline=datetime.fromisoformat(data.get('registrationDeadline')) if data.get('registrationDeadline') else None,
            academic_year=data.get('academicYear'),
            intake_period=data.get('intakePeriod'),
            field_of_study=data.get('fieldOfStudy'),
            study_level=data.get('studyLevel'),
            study_mode=data.get('studyMode'),
            description=data.get('description'),
            requirements=json.dumps(data.get('requirements', [])),
            application_fee=data.get('applicationFee'),
            tuition_fee=data.get('tuitionFee'),
            url=data.get('url'),
            application_portal_url=data.get('applicationPortalUrl'),
            contact_email=data.get('contactEmail'),
            contact_phone=data.get('contactPhone'),
            tags=json.dumps(data.get('tags', []))
        )
        
        db.session.add(new_admission)
        db.session.commit()
        
        return jsonify({'success': True, 'id': new_admission.admission_id})
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
        
        data = request.json
        
        admission.title = data.get('title', admission.title)
        admission.institution = data.get('institution', admission.institution)
        admission.institution_type = data.get('institutionType', admission.institution_type)
        admission.program_name = data.get('programName', admission.program_name)
        admission.application_deadline = datetime.fromisoformat(data.get('applicationDeadline')) if data.get('applicationDeadline') else admission.application_deadline
        admission.registration_deadline = datetime.fromisoformat(data.get('registrationDeadline')) if data.get('registrationDeadline') else admission.registration_deadline
        admission.academic_year = data.get('academicYear', admission.academic_year)
        admission.intake_period = data.get('intakePeriod', admission.intake_period)
        admission.field_of_study = data.get('fieldOfStudy', admission.field_of_study)
        admission.study_level = data.get('studyLevel', admission.study_level)
        admission.study_mode = data.get('studyMode', admission.study_mode)
        admission.description = data.get('description', admission.description)
        admission.requirements = json.dumps(data.get('requirements', [])) if 'requirements' in data else admission.requirements
        admission.application_fee = data.get('applicationFee', admission.application_fee)
        admission.tuition_fee = data.get('tuitionFee', admission.tuition_fee)
        admission.url = data.get('url', admission.url)
        admission.application_portal_url = data.get('applicationPortalUrl', admission.application_portal_url)
        admission.contact_email = data.get('contactEmail', admission.contact_email)
        admission.contact_phone = data.get('contactPhone', admission.contact_phone)
        admission.tags = json.dumps(data.get('tags', [])) if 'tags' in data else admission.tags
        admission.updated_at = datetime.utcnow()
        
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