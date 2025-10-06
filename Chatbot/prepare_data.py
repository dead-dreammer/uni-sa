import re
import yaml
from textblob import TextBlob  # ✅ Make sure you installed this: pip install textblob
import os

def parse_whatsapp_chat(file_path):
    with open(file_path, encoding="utf-8") as f:
        lines = f.readlines()

    pattern = r"^(\d{4}/\d{2}/\d{2}, \d{2}:\d{2}) - (.*?): (.*)"

    conversations = []
    last_sender = None
    last_message = None

    for line in lines:
        line = line.strip()
        match = re.match(pattern, line)
        if match:
            timestamp, sender, message = match.groups()
            if last_sender and sender != last_sender:
                # ✅ Analyze sentiment for both messages
                user_sentiment = TextBlob(last_message).sentiment.polarity
                bot_sentiment = TextBlob(message).sentiment.polarity

                conversations.append([
                    f"{last_message} [sentiment={user_sentiment:.2f}]",
                    f"{message} [sentiment={bot_sentiment:.2f}]"
                ])
            last_sender = sender
            last_message = message

    return conversations


def save_to_yaml(conversations, output_file):
    data = {
        "categories": ["whatsapp_chat"],
        "conversations": conversations
    }
    with open(output_file, "w", encoding="utf-8") as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False)


# Parse all chats in the folder
all_convos = []
chat_folder = "chats"
for file_name in os.listdir(chat_folder):
    if file_name.endswith(".txt"):
        file_path = os.path.join(chat_folder, file_name)
        all_convos.extend(parse_whatsapp_chat(file_path))

# Save combined conversations to YAML
output_yaml = "all_whatsapp_data.yml"
save_to_yaml(all_convos, output_yaml)

print(f"✅ Saved {len(all_convos)} conversation pairs to {output_yaml}")
