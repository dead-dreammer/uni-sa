from flask import Blueprint, jsonify, session, send_file, abort
import os
from Database.__init__ import db
from Database.models import Report
from datetime import datetime

reports = Blueprint('reports', __name__)

# base folder must match where courses.save stored files
REPORTS_BASE = os.path.join(os.path.dirname(__file__), 'uploads', 'reports')

@reports.route('/api/reports', methods=['GET'])
def api_get_reports():
    student_id = session.get('student_id')
    if not student_id:
        return jsonify({'error': 'Not logged in'}), 401

    reports_q = Report.query.filter_by(student_id=student_id).order_by(Report.created_at.desc()).all()
    out = [r.to_dict() for r in reports_q]
    return jsonify({'reports': out})

@reports.route('/reports/<int:report_id>/download', methods=['GET'])
def download_saved_report(report_id):
    student_id = session.get('student_id')
    if not student_id:
        return jsonify({'error': 'Not logged in'}), 401

    report = Report.query.get(report_id)
    if not report:
        return jsonify({'error': 'Report not found'}), 404

    if report.student_id != student_id:
        return abort(403)

    # Build path and send file
    student_dir = os.path.join(REPORTS_BASE, str(student_id))
    file_path = os.path.join(student_dir, report.filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found on server'}), 404

    return send_file(file_path, as_attachment=True, download_name=report.filename, mimetype='application/pdf')