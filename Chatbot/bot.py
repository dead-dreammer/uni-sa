import json # To read the dataset 
import nltk #Helps the chatbot understand and process human language, It provides tool like tokenizers for text analysis
import re  #Used for pattern matching and text cleaning
import string #Used for removing punctuation from text
from pathlib import Path #Finds exact location of json file
from difflib import get_close_matches #Checks which question in the dataset closely matches user input
from sklearn.feature_extraction.text import TfidfVectorizer #Helps the chatbot understand the importance of words in question
from sklearn.metrics.pairwise import cosine_similarity #This finds which stored question is most similar to the user's input
from flask import url_for #Generates URLs for Flask routes
# ----------------------------
# NLTK setup
# ----------------------------
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('wordnet')

# ----------------------------
# Load JSON dataset
# ----------------------------
base_path = Path(__file__).parent
file_path = base_path / "student_questions.json"

try:
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)
    if isinstance(data, dict) and "data" in data:
        records = data["data"]
    else:
        records = data
    records = [r for r in records if isinstance(r, dict)]
    questions = [item["question"] for item in records]
    answers = [item["answer"] for item in records]
except Exception as e:
    print(f"Error loading JSON: {e}")
    questions, answers = [], []

# ----------------------------
# Synonyms
# ----------------------------
synonyms = {
    "fee": ["fees", "cost", "price"],
    "course": ["courses", "class", "program"],
    "matric": ["school subjects", "grades", "aps"],
}

# ----------------------------
# Helper functions
# ----------------------------
def normalize_text(text: str) -> str:
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    for key, syn_list in synonyms.items():
        for syn in syn_list:
            text = re.sub(r"\b" + re.escape(syn) + r"\b", key, text)
    return re.sub(r"\s+", " ", text).strip()

def correct_spelling(user_input: str):
    if not questions:
        return None, None
    normalized_questions = [normalize_text(q) for q in questions]
    normalized_input = normalize_text(user_input)
    matches = get_close_matches(normalized_input, normalized_questions, n=3, cutoff=0.65)
    if matches:
        idx = normalized_questions.index(matches[0])
        return questions[idx], idx
    return None, None

# ----------------------------
# Precompute TF-IDF
# ----------------------------
if questions:
    normalized_questions = [normalize_text(q) for q in questions]
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(normalized_questions)
else:
    tfidf_matrix = None
    vectorizer = None

# ----------------------------
# Chatbot response
# ----------------------------
def chatbot_response(user_input: str) -> str:
    if not user_input or not user_input.strip():
        return "Please type something so I can assist you 🙂"
    if len(user_input.strip()) < 2:
        return "That seems too short — can you ask a full question?"
    if not questions:
        return "Sorry, my knowledge base is empty right now. Please check the dataset file."

    normalized_input = user_input.lower().strip()

    # --- Greetings ---
    greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]
    slang_greetings = ["what's up", "whats up", "sup", "yo", "how's it going", "how are you", "how you doing"]
    all_greetings = greetings + slang_greetings

    has_greeting = any(re.search(rf"\b{re.escape(g)}\b", normalized_input) for g in all_greetings)
    clean_input = re.sub(r"[^\w\s]", "", normalized_input)
    input_words = clean_input.split()
    greeting_words = []
    for g in all_greetings:
        greeting_words.extend(g.split())

    if has_greeting and all(word in greeting_words for word in input_words):
        if any(s in normalized_input for s in slang_greetings):
            return "Hey there dudeee 😎 All good here! What can I help you with today?"
        return "Hello! 👋 I’m ATOM, your student advisor. Ask me about courses, fees, or entry requirements."

    # Remove greeting from multi-intent input
    query_text = user_input
    if has_greeting:
        for g in all_greetings:
            query_text = re.sub(rf"\b{re.escape(g)}\b", "", query_text, flags=re.IGNORECASE)
        query_text = query_text.strip(" ,.?;:!-")

    # --- Spelling suggestion ---
    suggestion, sugg_idx = correct_spelling(query_text)
    if sugg_idx is not None and normalize_text(suggestion) != normalize_text(query_text):
        return f"Did you mean **'{questions[sugg_idx]}'**?\n\n{answers[sugg_idx]}"

    # --- TF-IDF similarity ---
    try:
        if vectorizer is None or tfidf_matrix is None:
            return "Sorry, chatbot knowledge base not ready."

        user_vec = vectorizer.transform([normalize_text(query_text)])
        similarity_scores = cosine_similarity(user_vec, tfidf_matrix)[0]
        best_idx = int(similarity_scores.argmax())
        best_score = float(similarity_scores[best_idx])

    except Exception as e:
        return f"Oops! Something went wrong ({e})"

    if best_score < 0.12:
          return (
        "Sorry, I didn’t quite get that 🤔. "
        f"Try sending us your question on the <a href='{url_for('contact')}'>Contact us page</a>"
    )
    else:
        return answers[best_idx]
