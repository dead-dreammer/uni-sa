import re
import yaml

def parse_whatsapp_chat(file_path):
    # Read the file
    with open(file_path, encoding="utf-8") as f:
        lines = f.readlines()

    # Regex pattern for WhatsApp messages
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
                # Add a conversation pair as a list of two strings
                conversations.append([last_message, message])
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

# Example usage
chat_file = "WhatsApp Chat.txt"
output_yaml = "whatsapp_data.yml"

convos = parse_whatsapp_chat(chat_file)
save_to_yaml(convos, output_yaml)

print(f"✅ Saved {len(convos)} conversation pairs to {output_yaml}")
