import re
import yaml
import os

def parse_whatsapp_chat(file_path):
    """
    Parses a WhatsApp chat file and returns conversation pairs.
    Consecutive messages from the same sender are concatenated.
    Only pairs messages between different senders.
    """
    with open(file_path, encoding="utf-8") as f:
        lines = f.readlines()

    pattern = r"^(\d{4}/\d{2}/\d{2}, \d{2}:\d{2}) - (.*?): (.*)"

    messages = []
    last_sender = None
    last_message = None

    for line in lines:
        line = line.strip()
        match = re.match(pattern, line)
        if match:
            timestamp, sender, message = match.groups()
            if last_sender == sender:
                # Concatenate consecutive messages from same sender
                last_message += " " + message
            else:
                if last_sender:
                    messages.append((last_sender, last_message))
                last_sender = sender
                last_message = message
    # Add last message
    if last_sender and last_message:
        messages.append((last_sender, last_message))

    # Create conversation pairs (only between different senders)
    conversations = []
    for i in range(len(messages) - 1):
        sender1, msg1 = messages[i]
        sender2, msg2 = messages[i + 1]
        if sender1 != sender2:
            conversations.append([msg1, msg2])

    return conversations

def parse_multiple_chats(chat_folder):
    """
    Parses all .txt files in the chat_folder and combines conversations.
    """
    all_conversations = []
    for filename in os.listdir(chat_folder):
        if filename.endswith(".txt"):
            file_path = os.path.join(chat_folder, filename)
            convos = parse_whatsapp_chat(file_path)
            all_conversations.extend(convos)
    return all_conversations

def save_to_yaml(conversations, output_file):
    data = {
        "categories": ["whatsapp_chat"],
        "conversations": conversations
    }
    with open(output_file, "w", encoding="utf-8") as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False)

if __name__ == "__main__":
    chat_folder = "Chatbot\chats"  # folder with multiple WhatsApp .txt files
    output_yaml = "whatsapp_data.yml"

    convos = parse_multiple_chats(chat_folder)
    save_to_yaml(convos, output_yaml)

    print(f"✅ Saved {len(convos)} conversation pairs to {output_yaml}")
