const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null;
let isResponseGenerating = false;
let chatSessionList = [];
let sessionId = "";

const API_KEY = "AIzaSyBdYLdODJARjAxYlBcuwkieajDcZrnUYA0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const DB_URL = `http://localhost:3000`;

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(" ");
  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    textElement.innerHTML +=
      (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");

    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  }, 20);
};

const getSessionId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  sessionId = urlParams.get("id");
  console.log(sessionId);
};

function formatMessages(input) {
  const output = {
      contents: []
  };

  const messageMap = {
      user: { role: "user", parts: [] },
      model: { role: "model", parts: [] }
  };

  input.forEach(message => {
      const { content, sender, sessionId } = message;
      if (messageMap[sender]) {
          messageMap[sender].parts.push({ text: content });
      }
  });

  output.contents.push(messageMap.user);
  output.contents.push(messageMap.model);

  return output;
}

const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");
  const apiData = await fetchChatHistory(sessionId);
  let apiHistory = formatMessages(apiData); 

  try {
    apiHistory.contents.push({
      role: "user",
      parts: [{ text: userMessage }],
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

    const formattedResponse = renderResponseContent(apiResponse);
    textElement.innerHTML = formattedResponse;

    apiHistory.contents.push({ 
      role: "model", 
      parts: [{ text: apiResponse }] 
    });

    saveChatHistoryToDB(userMessage, apiResponse, sessionId);
    loadDataFromBackend(sessionId);    

  } catch (error) {
    isResponseGenerating = false;
    textElement.innerText = error.message;
    textElement.parentElement.closest(".message").classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
};


const loadDataFromBackend = async () => {
  if (!sessionId) {
    console.warn("No session ID available. Skipping data load.");
    return;
  }
  try {
    const data = await fetchChatHistory(sessionId);
    const savedChats = data || [];

    chatContainer.innerHTML = "";

    savedChats.forEach((chat) => {
      const formattedResponse = renderResponseContent(chat.content);

      const messageDiv = document.createElement("div");
      messageDiv.className = `message-content ${
        chat.sender === "user" ? "user-message" : "model-message"
      }`;

      const avatar = document.createElement("img");
      avatar.className = "avatar";
      avatar.src = `images/${
        chat.sender === "user" ? "user.jpg" : "gemini.svg"
      }`;
      avatar.alt = `${chat.sender} avatar`;
      messageDiv.appendChild(avatar);

      const textParagraph = document.createElement("p");
      textParagraph.className = "text";
      textParagraph.innerHTML = formattedResponse;
      messageDiv.appendChild(textParagraph);

      const loadingIndicator = document.createElement("div");
      loadingIndicator.className = "loading-indicator";
      loadingIndicator.innerHTML = `
        <div class="loading-bar"></div>
        <div class="loading-bar"></div>
        <div class="loading-bar"></div>
      `;
      messageDiv.appendChild(loadingIndicator);

      const copyIcon = document.createElement("span");
      copyIcon.className = "icon material-symbols-rounded";
      copyIcon.setAttribute("onClick", "copyMessage(this)");
      copyIcon.innerText = "content_copy";

      chatContainer.appendChild(messageDiv);
      chatContainer.appendChild(copyIcon);
    });

    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  } catch (error) {
    console.error("Error loading chat data:", error);
  }
};


// const fetchSuggestions = async (incomingMessageDiv) => {
//   const textElement = incomingMessageDiv.querySelector(".text");
//   const userMessage = "userMessage";
//   const suggestions = [];

//   try {
//     const requestBody = {
//       contents: apiHistory,
//       userMessage: userMessage,
//       count: 3,
//     };

//     const response = await fetch(API_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(requestBody),
//     });

//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error.message);

//     data.candidates.forEach((candidate) => {
//       const suggestion = candidate.content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1");
//       suggestions.push(suggestion);
//     });

//     // const formattedSuggestions = suggestions.map(suggestion => `<li>${suggestion}</li>`).join("");
//     // textElement.innerHTML = `<ul>${formattedSuggestions}</ul>`;

//   } catch (error) {
//     textElement.innerText = error.message;
//     textElement.parentElement.closest(".message").classList.add("error");
//   } finally {
//     incomingMessageDiv.classList.remove("loading");
//   }
// };

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

  // Thay thế các khối code
  response.replace(codeBlockRegex, (match, language, code, offset) => {
    // Thêm văn bản trước khối mã
    if (offset > lastIndex) {
      const textNode = document.createTextNode(
        response.slice(lastIndex, offset)
      );
      tempElement.appendChild(textNode);
    }

    // Tạo khối mã
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

  // Thêm phần văn bản còn lại sau khối mã cuối cùng (nếu có)
  if (lastIndex < response.length) {
    const remainingText = response.slice(lastIndex);
    const textNode = document.createTextNode(remainingText);
    tempElement.appendChild(textNode);
  }

  // Xử lý mã inline và thêm ngắt dòng cho nội dung
  let finalHTML = tempElement.innerHTML;
  finalHTML = finalHTML.replace(inlineCodeRegex, (match, code) => {
    return `<code>${escapeHTML(code.trim())}</code>`;
  });

  // Thêm ngắt dòng cho ký tự xuống dòng
  finalHTML = finalHTML.replace(/\n/g, "<br>"); // Thay thế ký tự xuống dòng bằng <br>

  return finalHTML;
};

const showLoadingAnimation = () => {
  const html = `<div class="message-content">
                  <img class="avatar" src="images/gemini.svg" alt="Gemini avatar">
                  <p class="text"></p>
                  <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                  </div>
                </div>
                <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatContainer.appendChild(incomingMessageDiv);

  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  generateAPIResponse(incomingMessageDiv);
};

const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector(".text").innerText;

  navigator.clipboard.writeText(messageText);
  copyButton.innerText = "done"; // Show confirmation icon
  setTimeout(() => (copyButton.innerText = "content_copy"), 1000); // Revert icon after 1 second
};


const handleOutgoingChat = () => {
  userMessage =
    typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if (!userMessage || isResponseGenerating) return;

  isResponseGenerating = true;

  const content = `
    <img class="avatar" src="images/user.jpg" alt="User avatar">
    <p class="text">${userMessage}</p>
  `;
  const outgoingMessageDiv = createMessageElement(content, "user-message");
  chatContainer.appendChild(outgoingMessageDiv);

  typingForm.reset();
  document.body.classList.add("hide-header");
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showLoadingAnimation, 300);
};

toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

deleteChatButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
  }
});

suggestions.forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText;
    handleOutgoingChat();
  });
});

typingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleOutgoingChat();
});

const saveChatHistoryToDB = async (userMessage, apiResponse, sessionId) => {
  try {
    const response = await fetch(`${DB_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modelMessage: apiResponse,
        userMessage: userMessage,
        sessionId: sessionId || null,
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

const renderChatHistory = (messages) => {
  const chatContainer = document.getElementById("chat-container");
  chatContainer.innerHTML = "";

  messages.forEach((message) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    const html = `
          <div class="message-content">
              <img class="avatar" src="${
                message.sender === "user" ? "images/user.jpg" : ""
              }" alt="${message.sender} avatar">
              <p class="text">${message.content}</p>
          </div>`;

    messageDiv.innerHTML = html;

    if (message.sender === "user") {
      messageDiv.classList.add("user-message");
    } else if (message.sender === "model") {
      messageDiv.classList.add("model-message");
    }

    chatContainer.appendChild(messageDiv);
  });
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

const fetchAllChatSession = async () => {
  try {
    const response = await fetch(`${DB_URL}/chat/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok)
      throw new Error("Failed to fetch chat history from database.");
    const data = await response.json();
    console.log("All chat session fetched successfully:", data);
    return data;
  } catch (error) {
    console.error("Error fetching chat history:", error.message);
    return null;
  }
};

getSessionId();

loadDataFromBackend();
