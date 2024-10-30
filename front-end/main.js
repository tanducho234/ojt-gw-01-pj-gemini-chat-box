const sidebar = document.getElementById("chat-sidebar");
const toggleButton = document.getElementById("toggle-btn");

// Lấy các phần tử HTML
const toggleBtn = document.querySelector("#toggle-btn");
const chatSidebar = document.querySelector("#chat-sidebar");
const chatContainer = document.querySelector(".chat-container");


// Toggle sidebar mở/đóng
toggleBtn.addEventListener("click", () => {
  chatSidebar.classList.toggle("closed"); // Đóng/mở sidebar
  chatContainer.classList.toggle("full-width"); // Điều chỉnh container theo trạng thái sidebar
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



// Hàm lọc danh sách chat dựa trên từ khóa tìm kiếm
function filterChats() {
    return chatHistory.filter(chat => 
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

// Toggle trạng thái mở/đóng của sidebar
function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    document.querySelector("#chat-sidebar").classList.toggle("open", isSidebarOpen);
    document.querySelector("#toggle-btn").textContent = isSidebarOpen ? "▼" : "☰"; // Change button icon
}
toggleButton.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
    toggleButton.textContent = sidebar.classList.contains("collapsed") ? "☰" : "▶";
});

// Cập nhật từ khóa tìm kiếm và gọi render lại danh sách chat
function onSearchChange(value) {
    searchTerm = value;
    renderChats();
}
// Hàm rút gọn text
function truncateText(text, maxLength = 10) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
    }
    return text;
}
// Hàm render danh sách chat
function renderChats() {
    const chatList = document.querySelector("#chat-list");
    chatList.innerHTML = ""; // Xóa nội dung cũ
    
    const filteredChats = filterChats();
    
    // Kiểm tra nếu không có chat nào
    if (filteredChats.length === 0) {
        chatList.innerHTML = "<p class='no-chats'>No chats found.</p>";
        return;
    }
    
    // Render từng chat
    filteredChats.forEach(chat => {
        const chatItem = document.createElement("div");
        chatItem.classList.add("chat-session", "chat-item");
        
        // Sử dụng template string với cấu trúc HTML được cải thiện
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

        // Thêm event listeners
        const renameBtn = chatItem.querySelector(".rename-btn");
        const deleteBtn = chatItem.querySelector(".delete-btn");
        
        renameBtn.addEventListener("click", () => renameChat(chatItem));
        deleteBtn.addEventListener("click", () => deleteChat(chatItem));
    });
}
// Hàm đổi tên chat
function renameChat(chatItem) {
    const newName = prompt("Nhập tên mới cho cuộc trò chuyện:", chatItem.querySelector("h3").textContent);
    if (newName) {
        chatItem.querySelector("h3").textContent = newName;
    }
}

// Hàm xóa chat
function deleteChat(chatItem) {
    const confirmDelete = confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?");
    if (confirmDelete) {
        chatItem.remove();
    }
}

// Sự kiện khi nhấn nút toggle để mở/đóng sidebar
document.querySelector("#toggle-btn").addEventListener("click", toggleSidebar);

// Sự kiện khi thay đổi giá trị ô input tìm kiếm
document.querySelector(".search-input").addEventListener("input", (e) => {
    onSearchChange(e.target.value);
});

// Gọi hàm render ban đầu để hiển thị danh sách chat
renderChats();
