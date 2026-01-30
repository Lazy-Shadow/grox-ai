// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const newChatBtn = document.getElementById('new-chat-btn');
const chatList = document.getElementById('chat-list');
const chatArea = document.getElementById('chat-area');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const themeToggle = document.getElementById('theme-toggle');
const promptText = document.getElementById('prompt-text');
const deleteModal = document.getElementById('delete-modal');
const deleteMessage = document.getElementById('delete-message');
const deleteConfirm = document.getElementById('delete-confirm');
const deleteCancel = document.getElementById('delete-cancel');

let chats = JSON.parse(localStorage.getItem('groxai-chats') || '[]');
let activeChatId = localStorage.getItem('groxai-active-chat') || null;
let chatToDelete = null; // Store the chat ID to delete

// Load State from localStorage on Page Load
function loadState() {
    const savedTheme = localStorage.getItem('groxai-theme');
    const hasChatted = localStorage.getItem('groxai-has-chatted') === 'true';

    // Set Theme
    isDarkMode = savedTheme === 'dark';
    document.body.classList.toggle('dark-mode', isDarkMode);
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';

    // Hide prompt text if user has chatted before
    if (hasChatted) {
        promptText.style.display = 'none';
    }

    // Load Chats and Render Sidebar
    renderChatList();

    // Load Active Chat
    if (activeChatId && chats.find(c => c.id === activeChatId)) {
        loadChat(activeChatId);
    } else {
        createNewChat();
    }
}

// Save Chats to localStorage
function saveChats() {
    localStorage.setItem('groxai-chats', JSON.stringify(chats));
    localStorage.setItem('groxai-active-chat', activeChatId);
}

// Render Chat List in Sidebar (with 3-dot menu)
function renderChatList() {
    chatList.innerHTML = '';
    chats.forEach(chat => {
        const item = document.createElement('div');
        item.className = `chat-item ${chat.id === activeChatId ? 'active' : ''}`;
        
        const title = document.createElement('span');
        title.textContent = chat.title || 'New Chat';
        title.style.flex = '1';
        title.addEventListener('click', () => switchChat(chat.id));
        
        const menuBtn = document.createElement('button');
        menuBtn.className = 'chat-item-menu';
        menuBtn.textContent = '⋯';
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showDropdown(menuBtn, chat.id);
        });
        
        item.appendChild(title);
        item.appendChild(menuBtn);
        chatList.appendChild(item);
    });
}

// Show Dropdown Menu
function showDropdown(button, chatId) {
    // Close any open dropdown
    document.querySelectorAll('.dropdown-menu').forEach(menu => menu.remove());
    
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu show';
    
    const deleteItem = document.createElement('div');
    deleteItem.className = 'dropdown-item';
    deleteItem.textContent = 'Delete';
    deleteItem.addEventListener('click', () => showDeleteModal(chatId, dropdown));
    dropdown.appendChild(deleteItem);
    
    // Append to body for visibility
    document.body.appendChild(dropdown);
    
    // Position the dropdown
    const rect = button.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${rect.bottom + window.scrollY}px`;
    dropdown.style.left = `${rect.right + window.scrollX}px`;
    dropdown.style.zIndex = '10000';
    
    // Close on outside click
    document.addEventListener('click', () => dropdown.remove(), { once: true });
}

// Show Delete Modal
function showDeleteModal(chatId, dropdown) {
    dropdown.remove();
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    chatToDelete = chatId;
    deleteMessage.textContent = `This will delete "${chat.title || 'New Chat'}"`;
    deleteModal.classList.add('show');
}

// Handle Delete Action
function handleDelete() {
    if (!chatToDelete) return;
    
    const chatIndex = chats.findIndex(c => c.id === chatToDelete);
    if (chatIndex === -1) return;
    
    chats.splice(chatIndex, 1);
    if (activeChatId === chatToDelete) {
        activeChatId = null;
        createNewChat();
    }
    renderChatList();
    saveChats();
    closeDeleteModal();
}

// Close Delete Modal
function closeDeleteModal() {
    deleteModal.classList.remove('show');
    chatToDelete = null;
}

// Event Listeners for Modal
deleteConfirm.addEventListener('click', handleDelete);
deleteCancel.addEventListener('click', closeDeleteModal);
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
});

// Create New Chat
function createNewChat() {
    const newChat = { id: Date.now().toString(), title: 'New Chat', messages: [] };
    chats.unshift(newChat); // Add to top
    activeChatId = newChat.id;
    renderChatList();
    loadChat(activeChatId);
    saveChats();
}

// Switch to Existing Chat
function switchChat(chatId) {
    activeChatId = chatId;
    renderChatList();
    loadChat(chatId);
    saveChats();
}

// Load Chat into Chat Area
function loadChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    chatArea.innerHTML = '';
    chat.messages.forEach(msg => addMessage(msg.text, msg.isAI, false, msg.image));
}

// Theme Toggle
let isDarkMode = false;
themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('groxai-theme', isDarkMode ? 'dark' : 'light');
});

// Predefined AI Responses
const responses = [
    "Hmm, interesting question! 🤔 Let me think... Sounds like you need some tech magic. What exactly?",
    "Oh, coding? I'm your robot sidekick! 🚀 Tell me the language, and I'll whip up some code.",
    "Just chatting? Awesome! What's on your mind? Life, the universe, or kung ano-ano? 😄",
    "Problem-solving mode activated! 🔧 Describe it, and I'll help brainstorm.",
    "Oops, my circuits glitched! 😅 Try rephrasing that one.",
    "Thinking... 🤔 Ah, got it! Here's a quick tip: [Insert witty advice].",
    "You're full of great questions! 💡 Want me to explain step-by-step?"
];

// Function to Add Message to Chat
function addMessage(text, isAI = false, save = true, imageSrc = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isAI ? 'ai' : 'user'}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    
    if (imageSrc) {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.className = 'image-preview';
        bubble.appendChild(img);
    }
    
    messageDiv.appendChild(bubble);
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;

    if (save && activeChatId) {
        const chat = chats.find(c => c.id === activeChatId);
        chat.messages.push({ text, isAI, image: imageSrc });
        if (!isAI && !chat.title.startsWith(text)) {
            chat.title = text.length > 30 ? text.substring(0, 30) + '...' : text; // Update title
        }
        renderChatList();
        saveChats();
    }
}

// Typing Indicator
function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing';
    typingDiv.innerHTML = '<div class="typing-dot"></div>';
    chatArea.appendChild(typingDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
    return typingDiv;
}

// Simulate AI Response
function simulateResponse(userMessage, hasImage = false) {
    const typingIndicator = showTyping();
    const delay = Math.random() * 2000 + 1000;
    
    setTimeout(() => {
        chatArea.removeChild(typingIndicator);
        let response = responses[Math.floor(Math.random() * responses.length)];
        if (hasImage) {
            response = "Nice photo! 📸 What would you like to know or do with it? I can describe it, analyze, or help with anything!";
        }
        addMessage(response, true);
    }, delay);
}

// Handle File Upload
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            addMessage("Uploaded a photo!", false, true, event.target.result);
            messageInput.value = '';
            simulateResponse("", true);
        };
        reader.readAsDataURL(file);
    } else {
        addMessage("Oops, please upload a valid image file!", true);
    }
});

// Send Message
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) {
        addMessage("Oops, empty message! Try typing something fun or uploading a photo. 😅", true);
        return;
    }
    addMessage(text, false);
    messageInput.value = '';
    simulateResponse(text);
    
    // Mark as chatted and hide prompt permanently
    localStorage.setItem('groxai-has-chatted', 'true');
    promptText.style.display = 'none';
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Sidebar Toggle (Mobile)
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

// New Chat Button
newChatBtn.addEventListener('click', createNewChat);

// Function to Toggle Prompt Text
function togglePromptText() {
    const hasText = messageInput.value.trim().length > 0;
    const isFocused = document.activeElement === messageInput;
    promptText.classList.toggle('hidden', hasText || isFocused);
}

// Event Listeners for Input
messageInput.addEventListener('input', togglePromptText);
messageInput.addEventListener('focus', togglePromptText);
messageInput.addEventListener('blur', () => {
    setTimeout(togglePromptText, 100); // Delay to check if focus moved
});

// Initialize
loadState();