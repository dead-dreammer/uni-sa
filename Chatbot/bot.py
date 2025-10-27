import json
import nltk
import re
import string
from pathlib import Path
from difflib import get_close_matches
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------------------------------------------------------
# NLTK setup (safe load)
# ---------------------------------------------------------
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('wordnet')

# ---------------------------------------------------------
# Load JSON dataset
# ---------------------------------------------------------
base_path = Path(__file__).parent
file_path = base_path / "student_questions.json"

try:
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    # Support both formats: {"data": [...]} or direct list
    if isinstance(data, dict) and "data" in data:
        records = data["data"]
    else:
        records = data

    # Ignore placeholder entries (like "__NEW_ENTRIES_START__")
    records = [r for r in records if isinstance(r, dict) and r.get("question") != "__NEW_ENTRIES_START__"]

    questions = [item["question"] for item in records]
    answers = [item["answer"] for item in records]
except Exception as e:
    print(f"Error loading JSON: {e}")
    questions, answers = [], []

# ---------------------------------------------------------
# Synonyms mapping
# ---------------------------------------------------------
synonyms = {
    "fee": ["fees", "cost", "price"],
    "course": ["courses", "class", "program"],
    "matric": ["school subjects", "grades", "aps"],
}

# ---------------------------------------------------------
# Helper functions
# ---------------------------------------------------------
def normalize_text(text: str) -> str:
    """Lowercase, remove punctuation, replace synonyms (word-safe)."""
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    for key, syn_list in synonyms.items():
        for syn in syn_list:
            text = re.sub(r"\b" + re.escape(syn) + r"\b", key, text)
    return re.sub(r"\s+", " ", text).strip()


def correct_spelling(user_input: str):
    """Find closest question using fuzzy match on normalized text."""
    if not questions:
        return None, None
    normalized_questions = [normalize_text(q) for q in questions]
    normalized_input = normalize_text(user_input)
    matches = get_close_matches(normalized_input, normalized_questions, n=3, cutoff=0.65)
    if matches:
        idx = normalized_questions.index(matches[0])
        return questions[idx], idx
    return None, None

# ---------------------------------------------------------
# Main chatbot response logic
# ---------------------------------------------------------
def chatbot_response(user_input: str) -> str:
    if not user_input or not user_input.strip():
        return "Please type something so I can assist you 🙂"
    if len(user_input.strip()) < 2:
        return "That seems too short — can you ask a full question?"
    if not questions:
        return "Sorry, my knowledge base is empty right now. Please check the dataset file."

    normalized_input = user_input.lower().strip()

    # --- Greeting & slang detection ---
    greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]
    slang_greetings = ["what's up", "whats up", "sup", "yo", "how's it going", "how are you", "how you doing"]

    has_greeting = any(g in normalized_input for g in greetings + slang_greetings)

    # If only greeting (short message)
    if has_greeting and len(normalized_input.split()) <= 4:
        if any(s in normalized_input for s in slang_greetings):
            return "Hey there 😎 All good here! What can I help you with today?"
        return "Hello! 👋 I’m ATOM, your student advisor. Ask me about courses, fees, or entry requirements."

    # If greeting + question (multi-intent)
    query_text = user_input
    greeting_response = ""
    if has_greeting:
        greeting_response = "Hi! 👋 "
        cleaned = normalized_input
        for g in greetings + slang_greetings:
            cleaned = re.sub(r"\b" + re.escape(g) + r"\b", "", cleaned)
        cleaned = cleaned.strip(" ,.?;:!-")
        if cleaned:
            query_text = cleaned
        else:
            return "Hello! 👋 What would you like to know about UniSA or our partner institutions?"

    # --- Spelling correction ---
    suggestion, sugg_idx = correct_spelling(query_text)
    if sugg_idx is not None and normalize_text(suggestion) != normalize_text(query_text):
        return greeting_response + f"Did you mean **'{questions[sugg_idx]}'**?\n\n{answers[sugg_idx]}"

    # --- TF-IDF similarity ---
    try:
        normalized_questions = [normalize_text(q) for q in questions]
        user_norm = normalize_text(query_text)
        all_text = normalized_questions + [user_norm]
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf = vectorizer.fit_transform(all_text)
        similarity_scores = cosine_similarity(tfidf[-1], tfidf[:-1])[0]
        best_idx = int(similarity_scores.argmax())
        best_score = float(similarity_scores[best_idx])
    except Exception as e:
        return greeting_response + f"Oops! Something went wrong ({e})"

    if best_score < 0.12:
        return greeting_response + (
            "Sorry, I didn’t quite get that 🤔. Try asking about universities, courses, fees, or matric subjects."
        )
    else:
        return greeting_response + answers[best_idx]
