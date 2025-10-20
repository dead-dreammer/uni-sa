const chatButton = document.getElementById('chatButton');
const chatWidget = document.getElementById('chatWidget');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const chatBadge = document.querySelector('.chat-badge');

// Toggle chat widget
chatButton.addEventListener('click', () => {
    chatWidget.classList.toggle('open');
    chatButton.classList.toggle('active');
    if (chatWidget.classList.contains('open')) {
        userInput.focus();
        // Remove notification badge
        if (chatBadge) {
            chatBadge.style.display = 'none';
        }
    }
});

closeChat.addEventListener('click', () => {
    chatWidget.classList.remove('open');
    chatButton.classList.remove('active');
});

// Set current time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    document.getElementById('currentTime').textContent = `Today • ${timeString}`;
    document.getElementById('joinTime').textContent = timeString;
}
updateTime();

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

// Add message to chat
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    if (isUser) avatar.textContent = 'U'; // Only user has text avatar
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const p = document.createElement('p');
    p.textContent = text;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = getCurrentTime();
    
    contentDiv.appendChild(p);
    contentDiv.appendChild(time);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typingIndicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar'; // Bot avatar image
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>`;
    
    contentDiv.appendChild(typingIndicator);
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) typingIndicator.remove();
}

// Send message function
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';
    sendButton.disabled = true;

    showTypingIndicator();

    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        
        // Simulate natural typing delay
        setTimeout(() => {
            removeTypingIndicator();
            addMessage(data.reply || 'Sorry, I encountered an error.');
            sendButton.disabled = false;
        }, 800);

    } catch (error) {
        removeTypingIndicator();
        addMessage('Sorry, I couldn\'t connect to the server. Please try again.');
        sendButton.disabled = false;
    }
}

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
