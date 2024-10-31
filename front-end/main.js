// Sample chat history array
const chathistory = [
    {
        "content": "This is a message from the user.3",
        "sender": "user",
        "_id": "67208fc2adc4215255c7b94e"
    },
    {
        "content": "This is a message from the model.3",
        "sender": "model",
        "_id": "67208fc2adc4215255c7b94f"
    },
    {
        "content": "hello",
        "sender": "user",
        "_id": "6721de0680f06301f6f10ec8"
    },
    {
        "content": "Hello! How can I help you today?",
        "sender": "model",
        "_id": "6721de0680f06301f6f10ec9"
    },
    {
        "content": "cho tôi đoạn code js ngắn cộng 2 số",
        "sender": "user",
        "_id": "6721de1c80f06301f6f10ed4"
    },
    {
        "content": "Hello! How can I help you today?",
        "sender": "model",
        "_id": "6721de0680f06301f6f10ec9"
    },
    {
        "content": "cho tôi đoạn code js ngắn cộng 2 số",
        "sender": "user",
        "_id": "6721de1c80f06301f6f10ed4"
    },{
        "content": "Hello! How can I help you today?",
        "sender": "model",
        "_id": "6721de0680f06301f6f10ec9"
    },
    {
        "content": "cho tôi đoạn code js ngắn cộng 2 số",
        "sender": "user",
        "_id": "6721de1c80f06301f6f10ed4"
    },
    {
        "content": "Hello! How can I help you today?",
        "sender": "model",
        "_id": "6721de0680f06301f6f10ec9"
    },
    {
        "content": "cho tôi đoạn code js ngắn cộng 2 số",
        "sender": "user",
        "_id": "6721de1c80f06301f6f10ed4"
    },
    {
        "content": "Hello! How can I help you today?",
        "sender": "model",
        "_id": "6721de0680f06301f6f10ec9"
    },
    {
        "content": "cho tôi đoạn code js ngắn cộng 2 số",
        "sender": "user",
        "_id": "6721de1c80f06301f6f10ed4"
    },
    {
        "content": "Hello! How can I help you today?",
        "sender": "model",
        "_id": "6721de0680f06301f6f10ec9"
    },
    {
        "content": "cho tôi đoạn code js ngắn cộng 2 số",
        "sender": "user",
        "_id": "6721de1c80f06301f6f10ed4"
    },
    {
        "content": "Hello! How can I help you today?",
        "sender": "model",
        "_id": "6721de0680f06301f6f10ec9"
    },
    {
        "content": "cho tôi đoạn code js ngắn cộng 2 số",
        "sender": "user",
        "_id": "6721de1c80f06301f6f10ed4"
    },
    {
        "content": "Hello! How can I help you today?",
        "sender": "model",
        "_id": "6721de0680f06301f6f10ec9"
    },
    {
        "content": "cho tôi đoạn code js ngắn cộcho tôi đoạn code js ngắn cộng 2 sốcho tôi đoạn code js ngắn cộng 2 sốcho tôi đoạn code js ngắn cộng 2 sốcho tôi đoạn code js ngắn cộng 2 sốcho tôi đoạn code js ngắn cộng 2 sốcho tôi đoạn code js ngắn cộng 2 sốcho tôi đoạn code js ngắn cộng 2 sốcho tôi đoạn code js ngắn cộng 2 sốcho tôi đoạn code js ngắn cộng 2 sốcho tôi đoạn code js ngắn cộng 2 sốcho tôi đoạn code js ngắn cộng 2 sốcho tôi đoạn code js ngắn cộng 2 sống 2 số",
        "sender": "user",
        "_id": "6721de1c80f06301f6f10ed4"
    },
    {
        "content": "Hello! How can I help you todayello! How can I help you todayello! How can I help you todayello! How can I help you todayello! How can I help you todayello! How can I help you todayello! How can I help you todayello! How can I help you todayello! How can I help you todayello! How can I help you today?",
        "sender": "model",
        "_id": "6721de0680f06301f6f10ec9"
    },
   

];

// Select the chat messages container
const chatMessages = document.getElementById("chat-messages");

// Function to load and display chat history
function loadChatHistory() {
    chathistory.forEach(message => {
        addMessage(message.sender, message.content);
    });
}

// Function to add a message to the chat area
function addMessage(sender, messageText) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", sender);
    messageElement.textContent = messageText;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the bottom
}

// Function to send a message
function sendMessage() {
    const input = document.getElementById("user-input");
    const messageText = input.value.trim();

    if (messageText) {
        // Display user message
        addMessage("user", messageText);

        // Clear input field
        input.value = "";

        // Simulate AI response (you can replace this with real response from backend)
        setTimeout(() => addMessage("model", "This is a simulated AI response."), 1000);
    }
}

// Load chat history on page load
window.onload = loadChatHistory;
