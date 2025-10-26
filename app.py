from flask import Flask, render_template, request, jsonify
from Database.auth import auth
from Database.search import search
from Database.backup import backup_database
from Database.__init__ import db, create_database, create_app
from Chatbot.bot import chatbot_response
from Database.backup import backup_database, restore_latest_backup

app = create_app()

@app.after_request
def add_header(response):
    # Prevent caching during development
    response.headers["Cache-Control"] = "no-store"
    return response


# --- Routes for template pages ---
@app.route('/')
@app.route('/home')
def home_page():
    # root serves the main home page (template under templates/home/home_pg.html)
    return render_template('home/home_pg.html')


@app.route('/about')
def about():
    return render_template('About Us/about_us.html')


@app.route('/how-it-works')
def how_it_works():
    return render_template('how_it_works.html')


@app.route('/contact')
def contact():
    return render_template('Contact us/contact_us.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    # Combined login/signup page
    return render_template('Login/login_signup.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    # same template contains signup UI
    return render_template('Login/login_signup.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/ask', methods=['POST'])
def ask():
    user_message = request.json.get("message", "").strip().lower()

    # Exit/Goodbye handling
    exit_words = ["exit", "quit", "bye", "done", "goodbye", "stop"]
    if user_message in exit_words:
        reply = "Goodbye! 👋 Have a great day ahead!"
    else:
        try:
            reply = chatbot_response(user_message)
        except Exception as e:
            reply = f"Something unexpected happened ({e}). Please try again."

    return jsonify({"reply": reply})

@app.route('/start-search')
def start_search():
    return render_template('Search/start_my_search.html')


@app.route('/personal-info')
def personal_info():
    return render_template('Search/personal_info.html')


@app.route('/admissions')
def admissions():
    return render_template('Contact us/Student Tools/admissions.html')


@app.route('/bursaries')
def bursaries():
    return render_template('Contact us/Student Tools/bursaries.html')


@app.route('/terms')
def terms():
    return render_template('terms.html')


@app.route('/privacy')
def privacy():
    return render_template('privacy.html')


if __name__ == '__main__':
    # Runs the Flask development server
    app.run(host="0.0.0.0", port=5000, debug=True)