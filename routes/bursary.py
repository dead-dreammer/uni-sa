from flask import Blueprint, request, jsonify
from Database.__init__ import db
from Database.models import Bursary
from datetime import datetime
import json

bursary = Blueprint('bursary', __name__)

@bursary.route('/api/bursaries', methods=['GET'])
def get_bursaries():
    """Get all bursaries or filter by query parameters"""
    try:
        # Get query parameters
        provider_type = request.args.get('provider_type')
        field = request.args.get('field')
        level = request.args.get('level')
        
        # Start with base query
        query = Bursary.query
        
        # Apply filters if provided
        if provider_type and provider_type != 'all':
            query = query.filter(Bursary.provider_type == provider_type)
        if field and field != 'all':
            query = query.filter(Bursary.field_of_study.like(f'%{field}%'))
        if level and level != 'all':
            query = query.filter(Bursary.study_level.like(f'%{level}%'))
            
        bursaries = query.all()
        
        return jsonify([{
            'id': b.bursary_id,
            'title': b.title,
            'provider': b.provider,
            'providerType': b.provider_type,
            'amount': b.amount,
            'deadline': b.deadline.strftime('%Y-%m-%d') if b.deadline else None,
            'field': b.field_of_study,
            'level': b.study_level,
            'description': b.description,
            'requirements': json.loads(b.requirements) if b.requirements else [],
            'coverage': b.coverage,
            'url': b.url,
            'tags': json.loads(b.tags) if b.tags else []
        } for b in bursaries])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bursary.route('/api/bursaries', methods=['POST'])
def add_bursary():
    """Add a new bursary"""
    try:
        data = request.get_json()
        
        # Convert deadline string to date object
        deadline = datetime.strptime(data['deadline'], '%Y-%m-%d').date() if data.get('deadline') else None
        
        new_bursary = Bursary(
            title=data['title'],
            provider=data['provider'],
            provider_type=data['providerType'],
            amount=data['amount'],
            deadline=deadline,
            field_of_study=data['field'],
            study_level=data['level'],
            description=data['description'],
            requirements=json.dumps(data.get('requirements', [])),
            coverage=data['coverage'],
            url=data.get('url'),
            tags=json.dumps(data.get('tags', []))
        )
        
        db.session.add(new_bursary)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'id': new_bursary.bursary_id
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bursary.route('/api/bursaries/<int:bursary_id>', methods=['PUT'])
def update_bursary(bursary_id):
    """Update an existing bursary"""
    try:
        bursary = Bursary.query.get(bursary_id)
        if not bursary:
            return jsonify({'error': 'Bursary not found'}), 404
            
        data = request.get_json()
        
        # Update fields
        bursary.title = data['title']
        bursary.provider = data['provider']
        bursary.provider_type = data['providerType']
        bursary.amount = data['amount']
        bursary.deadline = datetime.strptime(data['deadline'], '%Y-%m-%d').date() if data.get('deadline') else None
        bursary.field_of_study = data['field']
        bursary.study_level = data['level']
        bursary.description = data['description']
        bursary.requirements = json.dumps(data.get('requirements', []))
        bursary.coverage = data['coverage']
        bursary.url = data.get('url')
        bursary.tags = json.dumps(data.get('tags', []))
        
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bursary.route('/api/bursaries/<int:bursary_id>', methods=['DELETE'])
def delete_bursary(bursary_id):
    """Delete a bursary"""
    try:
        bursary = Bursary.query.get(bursary_id)
        if not bursary:
            return jsonify({'error': 'Bursary not found'}), 404
            
        db.session.delete(bursary)
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500