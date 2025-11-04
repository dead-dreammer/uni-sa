from flask import request, jsonify
import os
from flask import Blueprint, render_template
import re
import pdfplumber
from Database.__init__ import db
from Database.models import WSProgram, WSUniversity
import pandas as pd

ws = Blueprint('ws', __name__, url_prefix='/ws')
VALID_DEGREES = ["Bachelor", "Diploma", "Master", "Certificate", "PhD"]
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def clean_degree_and_description(program_name, degree_column, other_description=None):
    degree_type = None
    extra_info = ""
    for deg in VALID_DEGREES:
        pattern = rf'\b{deg}\b'
        if degree_column and re.search(pattern, degree_column, re.IGNORECASE): 
            degree_type = deg
            extra_info = re.sub(pattern, '', degree_column, flags=re.IGNORECASE).strip()
            break
        elif program_name and re.search(pattern, program_name, re.IGNORECASE):
            degree_type = deg
            extra_info = ''
            break
    description = (extra_info + " " + other_description).strip() if other_description else extra_info
    description = re.sub(r'\s+', ' ', description).strip()
    return degree_type, description

def extract_programs_from_tables(pdf_path):
    programs = []
    if not os.path.exists(pdf_path):
        print("PDF file not found!")
        return programs

    IGNORE_KEYWORDS = ["APPLICANT", "PROSPECTUS", "ELIGIBLE", "GENERAL", "ADMISSION",
                       "REQUIREMENTS", "NOTE", "GUIDELINES"]
    last_program = None

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if not any(row):
                        continue
                    program_name = row[0].strip() if len(row) > 0 and row[0] else None
                    raw_degree_column = row[1].strip() if len(row) > 1 and row[1] else None
                    raw_duration_column = row[2].strip() if len(row) > 2 and row[2] else None
                    raw_description_column = " ".join([c.strip() for c in row[3:] if c]).strip() if len(row) > 3 else None

                    if program_name and any(word in program_name.upper() for word in IGNORE_KEYWORDS):
                        continue

                    if not program_name and last_program:
                        if raw_description_column:
                            last_program['description'] += " " + raw_description_column
                        continue

                    degree_type, description = clean_degree_and_description(program_name, raw_degree_column, raw_description_column)

                    duration_years = None
                    if raw_duration_column:
                        match = re.search(r'(\d+)', raw_duration_column)
                        if match:
                            duration_years = int(match.group(1))

                    if not degree_type:
                        continue

                    program_dict = {
                        "program_name": program_name,
                        "degree_type": degree_type,
                        "duration_years": duration_years,
                        "description": description
                    }
                    programs.append(program_dict)
                    last_program = program_dict

    for prog in programs:
        prog['description'] = re.sub(r'\s+', ' ', prog['description']).strip()

    return programs

def save_programs_to_db(programs, university_id):
    count = 0
    for prog in programs:
        program = WSProgram(
            university_id=university_id,
            program_name=prog.get('program_name'),
            degree_type=prog.get('degree_type'),
            duration_years=prog.get('duration_years'),
            description=prog.get('description')
        )
        db.session.add(program)
        count += 1
    db.session.commit()
    print(f"Saved {count} programs to DB")

    # Optional: export to CSV
    programs_db = WSProgram.query.all()
    programs_list = [
        {"program_id": p.program_id, "university_id": p.university_id,
         "program_name": p.program_name, "degree_type": p.degree_type,
         "duration_years": p.duration_years, "description": p.description}
        for p in programs_db
    ]
    df = pd.DataFrame(programs_list)
    df.to_csv("programs_export.csv", index=False)
    print("Exported programs to programs_export.csv")
@ws.route('/import-pdf', methods=['POST'])
def import_pdf():
    try:
        if 'pdf' not in request.files:
            return jsonify({'success': False, 'error': 'No file part'}), 400
        file = request.files['pdf']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No selected file'}), 400
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'success': False, 'error': 'Only PDF files are allowed'}), 400

        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        # Find or create university dynamically
        uni_name = request.form.get('university_name', 'Default University')
        university = WSUniversity.query.filter_by(name=uni_name).first()
        if not university:
            university = WSUniversity(name=uni_name)
            db.session.add(university)
            db.session.commit()

        # Scrape PDF and save programs
        programs = extract_programs_from_tables(filepath)
        if not programs:
            return jsonify({'success': False, 'error': 'No valid programs found in PDF'}), 400

        save_programs_to_db(programs, university.id)

        return jsonify({'success': True, 'message': f'PDF uploaded and programs saved for {uni_name}!'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
