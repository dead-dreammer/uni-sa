const chatButton = document.getElementById('chatButton');
const chatWidget = document.getElementById('chatWidget');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// === Initialize chat on load ===
function initializeChat() {
    // Restore chat open state on load
    try {
        const wasOpen = localStorage.getItem('chatOpen') === 'true';
        if (wasOpen) {
            chatWidget.classList.add('open');
            chatButton.classList.add('active');
            if (userInput) userInput.focus();
        }
        
        // Restore chat messages
        loadMessages();
    } catch (e) {
        console.warn('localStorage not available:', e);
    }
    updateTime();
}

// === Load messages from localStorage ===
function loadMessages() {
    try {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            const messages = JSON.parse(savedMessages);
            
            // Clear current messages except welcome message
            const welcomeMessage = chatMessages.querySelector('.welcome-message');
            chatMessages.innerHTML = '';
            
            // Re-add timestamp and welcome message
            const timestamp = document.createElement('div');
            timestamp.className = 'timestamp';
            timestamp.id = 'currentTime';
            chatMessages.appendChild(timestamp);
            
            if (welcomeMessage) {
                chatMessages.appendChild(welcomeMessage);
            }
            
            // Add saved messages
            messages.forEach(msg => {
                addMessageToDOM(msg.text, msg.isUser, msg.time);
            });
        }
    } catch (e) {
        console.warn('Error loading messages:', e);
    }
}

// === Save messages to localStorage ===
function saveMessages() {
    try {
        const messageElements = chatMessages.querySelectorAll('.message:not(#typingIndicator)');
        const messages = [];
        
        messageElements.forEach(msgEl => {
            const isUser = msgEl.classList.contains('user');
            const text = msgEl.querySelector('.message-content p').textContent;
            const time = msgEl.querySelector('.message-time').textContent;
            
            messages.push({ text, isUser, time });
        });
        
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (e) {
        console.warn('Error saving messages:', e);
    }
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChat);
} else {
    initializeChat();
}

// === Toggle chat widget ===
if (chatButton) {
    chatButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isOpen = chatWidget.classList.toggle('open');
        chatButton.classList.toggle('active');
        
        try {
            localStorage.setItem('chatOpen', isOpen);
        } catch (e) {
            console.warn('localStorage not available:', e);
        }

        if (isOpen && userInput) {
            // Small delay to ensure widget is visible before focusing
            setTimeout(() => userInput.focus(), 100);
        }
    });
}

if (closeChat) {
    closeChat.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        chatWidget.classList.remove('open');
        chatButton.classList.remove('active');
        
        try {
            localStorage.setItem('chatOpen', 'false');
        } catch (e) {
            console.warn('localStorage not available:', e);
        }
    });
}

// === Set current time ===
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    const currentTime = document.getElementById('currentTime');
    const joinTime = document.getElementById('joinTime');
    if (currentTime) currentTime.textContent = `Today • ${timeString}`;
    if (joinTime) joinTime.textContent = timeString;
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// === Add message to DOM (used for both new and loaded messages) ===
function addMessageToDOM(text, isUser = false, time = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

    const avatar = document.createElement('div');
    if (isUser) avatar.textContent = 'Student:';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const p = document.createElement('p');
    p.textContent = text;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = time || getCurrentTime();

    contentDiv.appendChild(p);
    contentDiv.appendChild(timeDiv);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// === Add message to chat (wrapper that saves to localStorage) ===
function addMessage(text, isUser = false) {
    addMessageToDOM(text, isUser);
    saveMessages();
}

// === Typing indicator ===
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';

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

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) typingIndicator.remove();
}

// === Send message ===
async function sendMessage() {
    if (!userInput || !sendButton) {
        console.error('Input or button not found');
        return;
    }
    
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';
    sendButton.disabled = true;

    showTypingIndicator();

    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        setTimeout(() => {
            removeTypingIndicator();
            addMessage(data.reply || 'Sorry, I encountered an error.');
            if (sendButton) sendButton.disabled = false;
        }, 800);
    } catch (error) {
        console.error('Error sending message:', error);
        removeTypingIndicator();
        addMessage('Sorry, I couldn\'t connect to the server. Please try again.');
        if (sendButton) sendButton.disabled = false;
    }
}

// Attach event listeners
if (sendButton) {
    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Send button clicked');
        sendMessage();
    });
}

if (userInput) {
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
}