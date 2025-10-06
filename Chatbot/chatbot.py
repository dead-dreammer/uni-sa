from textblob import TextBlob
from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer

chatbot = ChatBot("SentimentBot")
trainer = ChatterBotCorpusTrainer(chatbot)
trainer.train(r"C:\Users\dalzi\OneDrive\Desktop\Chatbot\uni-sa\Chatbot\all_whatsapp_data.yml")

def get_response(user_input):
    sentiment = TextBlob(user_input).sentiment.polarity
    response = chatbot.get_response(user_input)
    if sentiment < -0.3:
        return f"I'm sorry you're feeling that way. {response}"
    elif sentiment > 0.3:
        return f"That's great! {response}"
    else:
        return str(response)

while True:
    user_input = input("You: ")
    print("Bot:", get_response(user_input))
