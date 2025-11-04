# uct_pdf_scraper_clean.py
import pdfplumber
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import re
import os
import pandas as pd

# ---------------------- Flask App & DB Setup ----------------------
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///university.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ---------------------- Models ----------------------
class University(db.Model):
    university_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    programs = db.relationship('Program', backref='university', lazy=True)

class Program(db.Model):
    program_id = db.Column(db.Integer, primary_key=True)
    university_id = db.Column(db.Integer, db.ForeignKey('university.university_id'), nullable=False)
    program_name = db.Column(db.String(200), nullable=False)
    degree_type = db.Column(db.String(50))
    duration_years = db.Column(db.Integer)
    description = db.Column(db.Text)

# ---------------------- Helper Functions ----------------------
VALID_DEGREES = ["Bachelor", "Diploma", "Master", "Certificate", "PhD"]

def clean_degree_and_description(program_name, degree_column, other_description=None):
    """
    Extract degree type from program name or degree column.
    Extra info goes into description.
    """
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
            extra_info = ''  # program_name has degree
            break

    description = (extra_info + " " + other_description).strip() if other_description else extra_info
    # normalize spaces and newlines
    description = re.sub(r'\s+', ' ', description).strip()
    return degree_type, description

def extract_programs_from_tables(pdf_path):
    programs = []
    if not os.path.exists(pdf_path):
        print("PDF file not found!")
        return programs

    IGNORE_KEYWORDS = [
        "APPLICANT", "PROSPECTUS", "ELIGIBLE", "GENERAL", "ADMISSION",
        "REQUIREMENTS", "NOTE", "GUIDELINES"
    ]

    last_program = None  # store last program for continuation lines

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    # skip empty rows
                    if not any(row):
                        continue

                    # program name is in first column
                    program_name = row[0].strip() if len(row) > 0 and row[0] else None
                    raw_degree_column = row[1].strip() if len(row) > 1 and row[1] else None
                    raw_duration_column = row[2].strip() if len(row) > 2 and row[2] else None
                    raw_description_column = " ".join([c.strip() for c in row[3:] if c]).strip() if len(row) > 3 else None

                    # skip rows with general info
                    if program_name and any(word in program_name.upper() for word in IGNORE_KEYWORDS):
                        continue

                    # if row has no program name, it's continuation of previous description
                    if not program_name and last_program:
                        if raw_description_column:
                            last_program['description'] += " " + raw_description_column
                        continue

                    # now clean degree info
                    degree_type, description = clean_degree_and_description(
                        program_name, raw_degree_column, raw_description_column
                    )

                    # parse duration
                    duration_years = None
                    if raw_duration_column:
                        match = re.search(r'(\d+)', raw_duration_column)
                        if match:
                            duration_years = int(match.group(1))

                    # skip rows without degree type (not a real program)
                    if not degree_type:
                        continue

                    program_dict = {
                        "program_name": program_name,
                        "degree_type": degree_type,
                        "duration_years": duration_years,
                        "description": description
                    }
                    programs.append(program_dict)
                    last_program = program_dict  # save reference for next row

    # normalize description spaces
    for prog in programs:
        prog['description'] = re.sub(r'\s+', ' ', prog['description']).strip()

    return programs

# ---------------------- PDF Scraping Function ----------------------
def scrape_local_pdf_tables(pdf_path, university_id):
    programs = extract_programs_from_tables(pdf_path)
    if not programs:
        print("No valid programs found.")
        return

    count = 0
    for prog in programs:
        program = Program(
            university_id=university_id,
            program_name=prog.get('program_name'),
            degree_type=prog.get('degree_type'),
            duration_years=prog.get('duration_years'),
            description=prog.get('description')
        )
        db.session.add(program)
        count += 1

    db.session.commit()
    print(f"Scraped and saved {count} valid programs!")

    # Export to CSV
    programs_db = Program.query.all()
    programs_list = [
        {
            "program_id": p.program_id,
            "university_id": p.university_id,
            "program_name": p.program_name,
            "degree_type": p.degree_type,
            "duration_years": p.duration_years,
            "description": p.description
        }
        for p in programs_db
    ]
    df = pd.DataFrame(programs_list)
    df.to_csv("programs_export.csv", index=False)
    print("Programs exported to programs_export.csv")

# ---------------------- Main ----------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        scrape_local_pdf_tables("2025_ug_prospectus.pdf", university_id=1)
