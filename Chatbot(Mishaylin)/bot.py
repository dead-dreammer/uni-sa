import json
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from difflib import get_close_matches
import string

nltk.download('punkt')
nltk.download('wordnet')

# Load dataset
try:
    with open("student_questions.json", "r", encoding="utf-8") as file:
        data = json.load(file)
    questions = [item['question'] for item in data['data']]
    answers = [item['answer'] for item in data['data']]
except FileNotFoundError:
    print("Error: student_questions.json not found.")
    exit()
except json.JSONDecodeError:
    print("Error: JSON file is not properly formatted.")
    exit()

# Synonyms mapping
synonyms = {
    "fee": ["fees", "cost", "price"],
    "course": ["courses", "class", "program"],
    "matric": ["school subjects", "grades", "aps"]
}

def normalize_text(text):
    text = text.lower().translate(str.maketrans('', '', string.punctuation))
    for key, syn_list in synonyms.items():
        for syn in syn_list:
            text = text.replace(syn, key)
    return text

# Correct spelling with multiple suggestions
def correct_spelling(user_input):
    normalized_questions = [normalize_text(q) for q in questions]
    matches = get_close_matches(normalize_text(user_input), normalized_questions, n=3, cutoff=0.7)
    if matches:
        idx = normalized_questions.index(matches[0])
        return matches[0], idx
    return None, None

def chatbot_response(user_input):
    if not user_input.strip():
        return "Please type something so I can assist you 🙂"
    if len(user_input) < 2:
        return "That seems too short — can you ask a full question?"

    greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]
    if any(greet in user_input.lower() for greet in greetings):
        return "Hello! 👋 I’m ATOM, your student advisor. Ask me about courses, fees, or entry requirements."

    corrected_text, corrected_idx = correct_spelling(user_input)
    if corrected_idx is not None and corrected_text.lower() != normalize_text(user_input):
        return f"Did you mean **'{questions[corrected_idx]}'**?\n\n{answers[corrected_idx]}"

    try:
        all_text = [normalize_text(q) for q in questions] + [normalize_text(user_input)]
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf = vectorizer.fit_transform(all_text)
        similarity_scores = cosine_similarity(tfidf[-1], tfidf[:-1])
        idx = similarity_scores.argsort()[0][-1]
    except Exception as e:
        return f"Oops! Something went wrong ({e})"

    if similarity_scores[0][idx] < 0.1:
        return "Sorry, I didn’t quite get that 🤔. Try asking about universities, courses, fees, or matric subjects."
    else:
        return answers[idx]

# Run chatbot
print("ATOM: Hello, my name is ATOM! How may I help you choose your course?")
while True:
    try:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit", "bye", "done", "goodbye", "stop"]:
            print("ATOM: Goodbye! Have a great day 👋")
            break
        response = chatbot_response(user_input)
        print(f"ATOM: {response}")
    except KeyboardInterrupt:
        print("\nATOM: Goodbye! 👋")
        break
    except Exception as e:
        print(f"ATOM: Something unexpected happened ({e}). Please try again.")
