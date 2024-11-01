const suggestions = document.querySelectorAll(".suggestion");
const input = document.getElementById("user-input");

// Sample chat history array
let chatHistory = [];
let chatSessions = [];
let sessionId = "";

// Populate chat sessions in sidebar
function loadChatSessions() {
  const chatSessionsContainer = document.getElementById("chat-sessions");
  chatSessionsContainer.innerHTML = ""; // Clear existing sessions
  chatSessions.forEach((session) => {
    const sessionElement = document.createElement("div");

    // Create chat session name
    const nameElement = document.createElement("li");
    nameElement.textContent = session.name;
    nameElement.title = session.name; // Tooltip for full name on hover
    nameElement.onclick = () => {
      // Redirect to the same page with ?id={_id}
      window.location.href = `${window.location.pathname}?id=${session._id}`;
    };

    // Create button
    const buttonElement = document.createElement("button");
    buttonElement.textContent = "...";
    buttonElement.style.cursor = "pointer";
    buttonElement.onclick = (e) => {
      e.stopPropagation(); // Prevent the click from triggering the session click
      showContextMenu(e, session._id);
    };

    // Append elements to session
    sessionElement.appendChild(nameElement);
    sessionElement.appendChild(buttonElement);
    chatSessionsContainer.appendChild(sessionElement);
  });
}

// Function to show context menu
function showContextMenu(event, sessionId) {
  // Remove any existing context menu
  const existingMenu = document.querySelector(".context-menu");
  if (existingMenu) {
    existingMenu.remove();
  }

  // Create a new context menu
  const contextMenu = document.createElement("div");
  contextMenu.className = "context-menu"; // Add a class for styling
  contextMenu.style.position = "absolute";
  contextMenu.style.top = `${event.clientY}px`;
  contextMenu.style.left = `${event.clientX}px`;
  contextMenu.innerHTML = `
        <div class="context-menu-item" onclick="renameChatSession('${sessionId}')">
            <i class="fa fa-pencil"></i> Rename
        </div>
        <div style="color: red;" class="context-menu-item" onclick="deleteChatSession('${sessionId}')">
            <i class="fa fa-trash-o"  style="color: red;"></i> <p>Delete</p>
        </div>
    `;

  // Append context menu to body
  document.body.appendChild(contextMenu);

  // Remove context menu on click outside
  document.addEventListener(
    "click",
    () => {
      contextMenu.remove();
    },
    { once: true }
  );

  // Prevent the context menu from closing immediately when clicking inside it
  event.stopPropagation();
}

// Function to handle renaming a chat session
function renameChatSession(sessionIndex) {
  const session = chatSessions.find((s) => s._id === sessionIndex);
  const newName = prompt("Enter new name for the chat session:", session.name);
  if (newName) {
    putChatName(sessionIndex, newName);
    session.name = newName;
    loadChatSessions();
  }
}

// Function to handle deleting a chat session
async function deleteChatSession(sessionIdAboutToDelete) {
  const sessionIndex = chatSessions.findIndex(
    (s) => s._id === sessionIdAboutToDelete
  );
  if (confirm("Are you sure you want to delete this chat session?")) {
    deleteChatSessionById(sessionIdAboutToDelete);
    chatSessions.splice(sessionIndex, 1); // Remove the session from the array
    loadChatSessions(); // Refresh the chat sessions display
    if (sessionId == sessionIdAboutToDelete) {
      window.location.href = "chat.html";
    }
  }
}

// Select the chat messages container
const chatMessages = document.getElementById("chat-messages");

// Function to load and display chat history
function loadChatHistory() {
  chatHistory.forEach((message) => {
    if (message.sender === "model") {
      // Format the model's response content with HTML
      const formattedContent = renderResponseContent(message.content);
      addMessage(message.sender, formattedContent, true); // Pass true to indicate HTML
    } else {
      // For other senders, display content as is
      addMessage(message.sender, message.content, false); // Pass false to indicate plain text
    }
  });
}

function typeWriter(element, content, speed) {
  let index = 0;

  function type() {
      if (index < content.length) {
          element.textContent += content.charAt(index);
          index++;
          setTimeout(type, speed);
      }
  }

  type();
}

// Function to add a message to the chat area
function addMessage(sender, messageText, isHTML = false) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", sender);
  const formattedContent = renderResponseContent(messageText);

  if (isHTML) {
    // If content is HTML, use innerHTML
    messageElement.innerHTML = messageText;
  } else {
    // For plain text, convert line breaks to <br> elements and use innerHTML safely
    messageElement.textContent = formattedContent;
  }

  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the bottom
}

suggestions.forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    const userMessage = suggestion.querySelector(".text").innerText;    
    input.value = userMessage;
    sendMessage();
  });
});

// Function to send a message
async function sendMessage() {
  // const input = document.getElementById("user-input");
  const messageText = input.value.trim();

  if (messageText) {
    // Display user message
    addMessage("user", messageText, false);

    // Clear input field
    input.value = "";
    const apiResponse = await generateAPIResponse(messageText);

    // Simulate AI response (you can replace this with real response from backend)
    setTimeout(() => addMessage("model", apiResponse, true), 1000);
  }
}

// Load chat history on page load
// Load chat sessions on page load
window.onload = async () => {
  chatSessions = await fetchAllChatSession();
  loadChatSessions();
  getSessionId();
  if (!sessionId) {
    console.log("No chat sessions found.");
    const header = document.querySelector(".header");
    header.style.display = "block";
  } else {
    chatHistory = await fetchChatHistory(sessionId);
    loadChatHistory();
  }
};

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  // Toggle the display style between 'none' and 'block'
  if (sidebar.style.display === "none" || sidebar.style.display === "") {
    sidebar.style.display = "block"; // Show the sidebar
  } else {
    sidebar.style.display = "none"; // Hide the sidebar
  }
}

function startNewChat() {
  window.location.href = "chat.html";
}

const DB_URL = `https://sl36qhn5-3000.asse.devtunnels.ms`;

const fetchAllChatSession = async () => {
  try {
    const response = await fetch(`${DB_URL}/chat/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    console.log("aaqaa", response);
    if (response.status === 401) {
      window.location.href = "login-register.html";
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching chat history:", error.message);
    return null;
  }
};

const fetchChatHistory = async (sessionId) => {
  try {
    const response = await fetch(`${DB_URL}/chat/${sessionId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok)
      throw new Error("Failed to fetch chat history from database.");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching chat history:", error.message);
    return null;
  }
};

const saveChatHistoryToDB = async (userMessage, apiResponse, sessionId) => {
  try {
    const response = await fetch(`${DB_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modelMessage: apiResponse,
        userMessage: userMessage,
        sessionId: sessionId || "",
      }),
      credentials: "include",
    });

    if (sessionId === null) {
      const data = await response.json();
      const newSessionId = data.sessionId;
      if (newSessionId) {
        window.location.href = `?id=${newSessionId}`;
      } else {
        console.error("No session ID received from the server.");
      }
    }

    if (!response.ok)
      throw new Error("Failed to save chat history to database.");
    console.log("Chat history saved successfully.");
  } catch (error) {
    console.error("Error saving chat history:", error.message);
  }
};

const deleteChatSessionById = async (sessionId) => {
  try {
    const response = await fetch(`${DB_URL}/chat/${sessionId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok)
      throw new Error("Failed to delete chat history from database.");
    console.log("Chat history deleted successfully.");
  } catch (error) {
    console.error("Error deleting chat history:", error.message);
  }
};

const putChatName = async (sessionId, chatName) => {
  try {
    const response = await fetch(`${DB_URL}/chat/${sessionId}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: chatName }),
      credentials: "include",
    });

    if (!response.ok)
      throw new Error("Failed to update chat history to database.");
    console.log("Chat's name updated successfully.");
  } catch (error) {
    console.error("Error updating chat history:", error.message);
  }
};

function handleProfileClick() {
  alert("Profile icon clicked!");
}

function handleEnter(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

const getSessionId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  sessionId = urlParams.get("id");
};

let isResponseGenerating = false;
const API_KEY = "AIzaSyBdYLdODJARjAxYlBcuwkieajDcZrnUYA0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const generateAPIResponse = async (messageText) => {
  let apiHistory = { contents: [] };
  if (sessionId) {
    const apiData = await fetchChatHistory(sessionId);
    apiHistory = formatMessages(apiData);
  }

  try {
    apiHistory.contents.push({
      role: "user",
      parts: [{ text: messageText }],
    });

    console.log("User message sent:", apiHistory);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiHistory),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    const apiResponse = data?.candidates[0].content.parts[0].text.replace(
      /\*\*(.*?)\*\*/g,
      "$1"
    );

    console.log("répon", apiResponse);

    saveChatHistoryToDB(messageText, apiResponse, sessionId);
    // fetchSuggestions();
    return apiResponse;
  } catch (error) {
    // textElement.innerText = error.message;
    // textElement.parentElement.closest(".message").classList.add("error");
    console.log("error");
  }
  //   finally {
  //     isResponseGenerating = false;
  //     messageText.classList.remove("loading");
  //   }
};

const fetchSuggestions = async () => {
  let apiHistory = { contents: [] };
  const apiData = await fetchChatHistory(sessionId);
  apiHistory = formatMessages(apiData);

  try {
    apiHistory.contents.push({
      role: "user",
      parts: [
        {
          text: "Give me 3 searchable title suggestions with the content of the chat",
        },
      ],
    });

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiHistory),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    const suggestions = [];
    data.candidates.forEach((candidate) => {
      const suggestion = candidate.content.parts[0].text.replace(
        /\*\*(.*?)\*\*/g,
        "$1"
      );
      suggestions.push(suggestion);
    });
    console.log("suggest", suggestions);
    return suggestions;
  } catch (error) {
    textElement.innerText = error.message;
    textElement.parentElement.closest(".message").classList.add("error");
  }
};

const renderResponseContent = (response) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const inlineCodeRegex = /`([^`]+)`/g;

  const escapeHTML = (str) => {
    return str.replace(/[&<>"']/g, (match) => {
      const escapeChars = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return escapeChars[match];
    });
  };

  const tempElement = document.createElement("div");
  let lastIndex = 0;

  response.replace(codeBlockRegex, (match, language, code, offset) => {
    if (offset > lastIndex) {
      const textNode = document.createTextNode(
        response.slice(lastIndex, offset)
      );
      tempElement.appendChild(textNode);
    }

    const pre = document.createElement("pre");
    const codeElement = document.createElement("code");
    codeElement.className = `language-${
      language ? language.trim() : "plaintext"
    }`;
    codeElement.textContent = code.trim();
    pre.appendChild(codeElement);
    tempElement.appendChild(pre);

    lastIndex = offset + match.length;
  });

  if (lastIndex < response.length) {
    const remainingText = response.slice(lastIndex);
    const textNode = document.createTextNode(remainingText);
    tempElement.appendChild(textNode);
  }

  let finalHTML = tempElement.innerHTML;
  finalHTML = finalHTML.replace(inlineCodeRegex, (match, code) => {
    return `<code>${escapeHTML(code.trim())}</code>`;
  });

  finalHTML = finalHTML.replace(/\n/g, "<br>");

  return finalHTML;
};

function formatMessages(input) {
  const output = {
    contents: [],
  };

  const messageMap = {
    user: { role: "user", parts: [] },
    model: { role: "model", parts: [] },
  };

  input.forEach((message) => {
    const { content, sender, sessionId } = message;
    if (messageMap[sender]) {
      messageMap[sender].parts.push({ text: content });
    }
  });

  output.contents.push(messageMap.user);
  output.contents.push(messageMap.model);

  return output;
}

// Array of suggestions
const promtSuggestions = [
  "Help me plan a game night with my 5 best friends for under $100.",
  "What are the best tips to improve my public speaking skills?",
  "Can you help me find the latest news on web development?",
  "Write JavaScript code to sum all elements in an array.",
  "Recommend a good book for self-improvement.",
  "How do I start a daily meditation routine?",
  "Share some easy and quick dinner recipes.",
  "What is the best way to learn a new language?",
  "Suggest a workout routine for beginners.",
  "Tell me a motivational quote.",
  // Add as many suggestions as you'd like
];

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Shuffle the suggestions array and select the first 4
const randomSuggestions = shuffleArray(promtSuggestions).slice(0, 4);

// Insert the random suggestions into elements with IDs suggest-1 to suggest-4
randomSuggestions.forEach((suggestion, index) => {
  const suggestionElement = document.getElementById(`suggest-${index + 1}`);
  if (suggestionElement) {
    suggestionElement.innerText = suggestion;
  }
});
