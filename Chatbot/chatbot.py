from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer

chatbot = ChatBot('WhatsBot')

trainer = ChatterBotCorpusTrainer(chatbot)

# Train on your custom WhatsApp data
trainer.train("C:/Users/dalzi/OneDrive/Desktop/Chatbot/whatsapp_data.yml")


print("Training complete! Start chatting below:")

while True:
    user_input = input("You: ")
    if user_input.lower() == 'quit':
        break
    response = chatbot.get_response(user_input)
    print("Bot:", response)
