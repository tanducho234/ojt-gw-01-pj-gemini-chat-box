const suggestions = document.querySelectorAll(".suggestion");
const input = document.getElementById("user-input");
const header = document.querySelector(".header");

const submitChatIcon = document.getElementById("submit-chat-icon");
const sendMessageButton = document.getElementById("sendMessageBtn");

// Sample chat history array
let suggestion = [];
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
    resultsContainer.appendChild(sessionElement);
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
  contextMenu.style.top = `${event.clientY - 50}px`;
  contextMenu.style.left = `${event.clientX - 150}px`;
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

// Function to load and display chat history
function loadChatHistory() {
  chatHistory.forEach((message) => {
    addMessage(message.sender, message.content); // Pass false to indicate plain text
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
function addMessage(classNames, message) {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("chat-message", classNames);

  // Use marked.parse to parse Markdown and set it as HTML with syntax highlighting
  messageContainer.innerHTML = marked.parse(message);
  document.getElementById("chat-messages").appendChild(messageContainer);
  document.getElementById("chat-messages").scrollTo({
    top: document.getElementById("chat-messages").scrollHeight,
    behavior: "smooth",
  });
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
  const suggestionContainer = document.getElementById("suggestion-buttons");
  if (suggestionContainer) {
    suggestionContainer.remove();
  }
  const messageText = input.value.trim();
  console.log(messageText);
  console.log("aaa", sessionId);
  if (!sessionId) {
    header.style.display = "none";
  }
  if (messageText) {
    // Display user message
    console.log("messageText", messageText);
    chatHistory.push({ content: messageText, sender: "user" });
    addMessage("user", messageText);

    // Clear input field
    input.value = "";

    // Disable the button
    sendMessageButton.disabled = true;
    input.disabled = true;

    // Change image to loading state
    submitChatIcon.src = "images/line-md--loading-loop.png";
    submitChatIcon.classList.add("rotate");
    document.getElementById('user-input').placeholder = 'Please wait...';    

    await Promise.all([generateAPIResponse(messageText), fetchSuggestions()])
      .then(async ([apiResponse, suggestion]) => {

        // Display AI response
        addMessage("model", apiResponse);
        chatHistory.push({ content: apiResponse, sender: "model" });
        console.log("suggestion", suggestion);
        // Create buttons with proper escaping and validation
        let buttonsHTML = suggestion
          .filter((question) => question && typeof question === "string")
          .map((question) => {
            return `
            <button 
              style="
                border-style: dashed;
                border-color: #0068a0;
                margin-top: 0;
                margin-bottom: 5px;
                padding: 10px;
                cursor: pointer;

              "
              class="suggestion-btn chat-message user" 
              onclick="handleQuestion('${question}')"
            >
              ${question}
            </button>
          `;
          })
          .join("");

        // Create suggestion container with error handling
        const suggestionContainer = document.createElement("div");
        suggestionContainer.id = "suggestion-buttons";
        suggestionContainer.className = "suggestion-container";

        if (buttonsHTML) {
          suggestionContainer.innerHTML = buttonsHTML;
          document
            .getElementById("chat-messages")
            ?.appendChild(suggestionContainer);
          // document.getElementById("chat-messages").scrollTo({
          //   top: document.getElementById("chat-messages").scrollHeight,
          //   behavior: "smooth",
          // });
        }
      })
      .catch((error) => {
        console.error("Error generating API response:", error);
        // Optionally handle error
      })
      .finally(() => {
        // Restore original image and remove rotation
        submitChatIcon.src = "images/ion--arrow-forward-circle.png";
        submitChatIcon.classList.remove("rotate");
        document.getElementById('user-input').placeholder = 'Type your message';    

        // Re-enable the button
        sendMessageButton.disabled = false;
        input.disabled = false;
        input.focus();
        if (sessionId) {
          const sessionIndex = chatSessions.findIndex(
            (s) => s._id === sessionId
          );
          if (sessionIndex > 0) {
            const session = chatSessions.splice(sessionIndex, 1)[0];
            chatSessions.unshift(session);
          }
          loadChatSessions();
        }
      });
  }
}

function handleQuestion(question) {
  const userMessage = question;
  input.value = userMessage;
  sendMessage();
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
        sidebar.style.width = "100%"; // Show the sidebar
        chatArena.style.display = "none";
      } else {
        chatArena.style.display = "flex";
        chatArena.style.width = "100%";
        sidebar.style.display = "none"; // Hide the sidebar
      }
      break;

    case width >= 768 && width < 1024: // Tablet
      if (sidebar.style.display === "none" || sidebar.style.display === "") {
        sidebar.style.display = "block"; // Show the sidebar
        sidebar.style.width = "30%"; // Show the sidebar
        chatArena.style.width = "70%";
      } else {
        chatArena.style.display = "flex";
        chatArena.style.width = "100%";
        sidebar.style.display = "none"; // Hide the sidebar
      }
      break;

    default: // Desktop/Web
      if (sidebar.style.display === "none") {
        sidebar.style.display = "block"; // Show the sidebar
        chatArena.style.width = "80%";
        sidebar.style.width = "20%";

        chatArena.style.display = "flex";
      } else {
        sidebar.style.display = "none"; // Hide the sidebar
        chatArena.style.width = "100%";
        chatArena.style.display = "flex";
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
  let apiResponse = "";
  let apiHistory = {
    contents: chatHistory.map((message) => ({
      role: message.sender,
      parts: [{ text: message.content }],
    })),
  };

  console.log("chatHistory", apiHistory);

  try {
    console.log("User message sent:", apiHistory);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiHistory),
    });

    const data = await response.json();

    apiResponse = data?.candidates[0].content.parts[0].text;

    saveChatHistoryToDB(messageText, apiResponse);
    return apiResponse; // Return the response here
  } catch (error) {
    console.error("Error:", error);
    throw error; // Throw the error to be caught by the calling function
  }
};

const fetchSuggestions = async () => {
  let apiResponse = "";
  let apiHistory = {
    contents: chatHistory.map((message) => ({
      role: message.sender,
      parts: [{ text: message.content }],
    })),
  };

  apiHistory.contents.pop();
  apiHistory.contents.push({
    role: "user",
    parts: [
      {
        text: "Read the previous messages in this chat and suggest three shorts questions I could ask next to continue the conversation or get more information. Ask the questions in the language the user uses.",
      },
    ],
  });

  try {
    console.log("suggest sent:", apiHistory);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiHistory),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    apiResponse = data?.candidates[0].content.parts[0].text;
    console.log("suggestapiResponse", apiResponse);

    const lines = apiResponse.split("\n");

    // Extract text inside double asterisks on each line
    let questions = lines
      .filter((line) => line.includes("**")) // Keep only lines that contain '**'
      .map((line) => {
        // Extract the text within the first pair of asterisks
        const start = line.indexOf("**") + 2;
        const end = line.indexOf("**", start);
        return line.slice(start, end).replace(/"/g, ""); // Remove surrounding quotes if present
      });
    questions.sort((a, b) => b.length - a.length);
    console.log("ques", questions);

    return questions;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

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
