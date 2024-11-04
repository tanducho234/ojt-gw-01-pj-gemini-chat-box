const suggestions = document.querySelectorAll(".suggestion");
const input = document.getElementById("user-input");
const header = document.querySelector(".header");

const submitChatIcon = document.getElementById("submit-chat-icon");
const sendMessageButton = document.getElementById("sendMessageBtn");

// Sample chat history array
let chatHistory = [];
let chatSessions = [];
let sessionId = "";

// Function to display the search results in the <ul> element
const displaySearchResults = (results) => {
  const resultsContainer = document.getElementById("chat-sessions");
  resultsContainer.innerHTML = ""; // Clear previous results

  if (results.length === 0) {
    const noResultItem = document.createElement("li");
    noResultItem.textContent = "No matches found";
    resultsContainer.appendChild(noResultItem);
    return;
  }

  // Display each matching chat session as an <li> item
  results.forEach((session) => {
    const sessionItem = document.createElement("li");
    sessionItem.textContent = session.name;
    resultsContainer.appendChild(sessionItem);
  });
};

const filterChatSessions = (searchTerm) => {
  return chatSessions.filter((session) =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

document.getElementById("searchInput").addEventListener("input", (event) => {
  const searchTerm = event.target.value;
  const results = filterChatSessions(searchTerm);
  displaySearchResults(results);
});

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
    buttonElement.style.paddingLeft = "10px"; // Add left padding
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
async function renameChatSession(sessionIndex) {
  const session = chatSessions.find((s) => s._id === sessionIndex);
  const newName = prompt("Enter new name for the chat session:", session.name);
  if (newName) {
    await putChatName(sessionIndex, newName);
    session.name = newName;
    loadChatSessions();
  }
}

// Function to handle deleting a chat session
async function deleteChatSession(sessionIdAboutToDelete) {
  const sessionIndex = chatSessions.findIndex(
    (s) => s._id === sessionIdAboutToDelete
  );
  if (confirm(`Are you sure you want to delete this chat session?`)) {
    await deleteChatSessionById(sessionIdAboutToDelete);
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
    header.style.display = "none";
    const userMessage = suggestion.querySelector(".text").innerText;
    input.value = userMessage;
    sendMessage();
  });
});

// Function to send a message
async function sendMessage() {
  const messageText = input.value.trim();
  console.log(messageText);
  console.log("aaa", sessionId);
  if (!sessionId) {
    header.style.display = "none";
  }
  if (messageText) {
    // Display user message
    addMessage("user", messageText, false);

    // Clear input field
    input.value = "";

    // Disable the button
    sendMessageButton.disabled = true;
    input.disabled = true;

    // Change image to loading state
    submitChatIcon.src = "images/line-md--loading-loop.png";
    submitChatIcon.classList.add("rotate");

    try {
      const apiResponse = await generateAPIResponse(messageText);
      const formatMessages = renderResponseContent(apiResponse);
      // Display AI response
      addMessage("model", formatMessages, true);
    } catch (error) {
      console.error("Error generating API response:", error);
      // Optionally handle error
    } finally {
      // Restore original image and remove rotation
      submitChatIcon.src = "images/ion--arrow-forward-circle.png";
      submitChatIcon.classList.remove("rotate");

      // Re-enable the button
      sendMessageButton.disabled = false;
      input.disabled = false;
      input.focus();
    }
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
    header.style.display = "block";
  } else {
    chatHistory = await fetchChatHistory(sessionId);
    loadChatHistory();
  }
};

function toggleSidebar() {
  console.log("toggleSidebar()");
  const sidebar = document.getElementById("sidebar");
  const inputChat = document.getElementById("chat-input");
  const chatArena = document.getElementById("chat-area");

  // Toggle the display style between 'none' and 'block'
  // if (sidebar.style.display === "none" || sidebar.style.display === "") {
  //   sidebar.style.display = "block"; // Show the sidebar
  //   inputChat.style.left = "10%";
  //   chatArena.style.width = "80%";

  // } else {
  //   sidebar.style.display = "none"; // Hide the sidebar
  //   inputChat.style.left = "";
  //   chatArena.style.width = "100%";

  // }
  const width = window.innerWidth;

  switch (true) {
    case width < 768: // Mobile
      if (sidebar.style.display === "none" || sidebar.style.display === "") {
        sidebar.style.display = "block"; // Show the sidebar
        chatArena.style.display = "none";
        inputChat.style.left = "10%";
        sidebar.style.width = "100%"; // Show the sidebar
      } else {
        chatArena.style.display = "block";
        chatArena.style.width = "100%";
        sidebar.style.display = "none"; // Hide the sidebar
        inputChat.style.left = "";
      }
      break;

    case width >= 768 && width < 1024: // Tablet
    if (sidebar.style.display === "none" || sidebar.style.display === "") {
      sidebar.style.display = "block"; // Show the sidebar
      inputChat.style.left = "15%";
      sidebar.style.width = "30%"; // Show the sidebar
      chatArena.style.width = "70%";
    } else {
      chatArena.style.display = "block";
      chatArena.style.width = "100%";
      sidebar.style.display = "none"; // Hide the sidebar
      inputChat.style.left = "0%";
    }
      break;

    default: // Desktop/Web
      if (sidebar.style.display === "none") {
        sidebar.style.display = "block"; // Show the sidebar
        inputChat.style.left = "10%";
        chatArena.style.width = "80%";
      } else {
        sidebar.style.display = "none"; // Hide the sidebar
        inputChat.style.left = "0%";
        chatArena.style.width = "100%";
      }
      break;
  }
}

function startNewChat() {
  window.location.href = "chat.html";
}

const DB_URL = `https://ojt-gw-01-pj-gemini-chat-box.vercel.app`;

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

const saveChatHistoryToDB = async (userMessage, apiResponse) => {
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
    if (!sessionId) {
      const data = await response.json();
      const newSessionId = data.sessionId;
      if (newSessionId) {
        // window.location.href = `?id=${newSessionId}`;
        sessionId = newSessionId;
        chatSessions = await fetchAllChatSession();
        loadChatSessions();
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
  window.location.href = "profile.html";
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

    saveChatHistoryToDB(messageText, apiResponse);
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
    codeElement.textContent = code;
    pre.appendChild(codeElement);
    tempElement.appendChild(pre);

    lastIndex = offset + match.length;
  });

  if (lastIndex < response.length) {
    const remainingText = response.slice(lastIndex);
    const textNode = document.createTextNode(remainingText);
    tempElement.appendChild(textNode);
  }

  let finalHTML = tempElement.innerHTML.replace(
    inlineCodeRegex,
    (match, code) => {
      return `<code>${code}</code>`;
    }
  );

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
