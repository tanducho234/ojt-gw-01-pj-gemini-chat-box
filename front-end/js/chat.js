const sidebar = document.getElementById("chat-sidebar");
const toggleButton = document.getElementById("toggle-btn");


const toggleBtn = document.querySelector("#toggle-btn");
const chatSidebar = document.querySelector("#chat-sidebar");
const chatContainer = document.querySelector(".chat-container");

const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');




function addMessage(message, isUser = true) {
  const messageDiv = document.createElement('div');
  messageDiv.className = isUser ? 'user-message' : 'bot-message';
  messageDiv.textContent = message;
  chatMessages.appendChild(messageDiv);


  chatMessages.scrollTop = chatMessages.scrollHeight;
}



sendBtn.addEventListener('click', () => {
  const message = userInput.value.trim();
  if (message) {
    addMessage(message);  
    userInput.value = ''; 

    
    setTimeout(() => {
      addMessage('This is a bot response.', false);
    }, 1000);
  }
});


userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendBtn.click();
  }
});


toggleBtn.addEventListener("click", () => {
  chatSidebar.classList.toggle("closed");
  chatContainer.classList.toggle("full-width"); 
});


// Default chat data
const chatHistory = [
    {
        "_id": "67208fc2adc4215255c7b94d",
        "name": "this is conver âsasasas1"
    },
    {
        "_id": "67208fc4adc4215255c7b951",
        "name": "renamed"
    }
];

// Initialize the state variables
let isSidebarOpen = false;
let searchTerm = "";




function filterChats() {
    return chatHistory.filter(chat => 
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
}


function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    document.querySelector("#chat-sidebar").classList.toggle("open", isSidebarOpen);
    document.querySelector("#toggle-btn").textContent = isSidebarOpen ? "▼" : "☰"; 
}
toggleButton.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
    toggleButton.textContent = sidebar.classList.contains("collapsed") ? "☰" : "▶";
});


function onSearchChange(value) {
    searchTerm = value;
    renderChats();
}

function truncateText(text, maxLength = 20) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
    }
    return text;
}

function renderChats() {
    const chatList = document.querySelector("#chat-list");
    chatList.innerHTML = ""; 
    
    const filteredChats = filterChats();
    
  
    if (filteredChats.length === 0) {
        chatList.innerHTML = "<p class='no-chats'>No chats found.</p>";
        return;
    }
    
    
    filteredChats.forEach(chat => {
        const chatItem = document.createElement("div");
        chatItem.classList.add("chat-session", "chat-item");
        
       
        chatItem.innerHTML = `
            <div class="chat-content">
                <div class="chat-title" title="${chat.name}">
                    <h3>${chat.name}</h3>
                </div>
                <div class="chat-actions">
                    <button class="rename-btn" title="Rename chat">✎</button>
                    <button class="delete-btn" title="Delete chat">🗑</button>
                </div>
            </div>
        `;

        chatList.appendChild(chatItem);

        
        const renameBtn = chatItem.querySelector(".rename-btn");
        const deleteBtn = chatItem.querySelector(".delete-btn");
        
        renameBtn.addEventListener("click", () => renameChat(chatItem));
        deleteBtn.addEventListener("click", () => deleteChat(chatItem));
    });
}



function renameChat(chatItem) {
    const newName = prompt("Nhập tên mới cho cuộc trò chuyện:", chatItem.querySelector("h3").textContent);
    if (newName) {
        chatItem.querySelector("h3").textContent = newName;
    }
}





function deleteChat(chatItem) {
    const confirmDelete = confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?");
    if (confirmDelete) {
        chatItem.remove();
    }
}

const typingIndicator = document.getElementById("typing-indicator");


function showTypingIndicator() {
  typingIndicator.style.display = "block";
}


function hideTypingIndicator() {
  typingIndicator.style.display = "none";
}


document.querySelector(".send-btn").addEventListener("click", () => {
  showTypingIndicator();
  
  
  setTimeout(() => {
    hideTypingIndicator();
   
  }, 2000); 
});


//  sidebar
document.querySelector("#toggle-btn").addEventListener("click", toggleSidebar);


document.querySelector(".search-input").addEventListener("input", (e) => {
    onSearchChange(e.target.value);
});

renderChats();