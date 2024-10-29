const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

// State variables
let userMessage = null;
let isResponseGenerating = false;
let messageHistory = [];
let apiHistory = [];


// API configuration
const API_KEY = "AIzaSyBdYLdODJARjAxYlBcuwkieajDcZrnUYA0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

// Load theme and chat data from local storage on page load
const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem("saved-chats");
  const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

  // Apply the stored theme
  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

  // Restore saved chats or clear the chat container
  chatContainer.innerHTML = savedChats || '';
  document.body.classList.toggle("hide-header", savedChats);

  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
}

// Create a new message element and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
}

// Show typing effect by displaying words one by one
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(' ');
  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    // Append each word to the text element with a space
    textElement.innerHTML  += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");

    // If all words are displayed
    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("saved-chats", chatContainer.innerHTML); // Save chats to local storage
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  }, 75);
}

let sessionId="";

const getSessionId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  sessionId = urlParams.get('id'); 
  console.log(sessionId); 
  // fetchChatHistory(sessionId);
  
}



// Fetch response from the API based on user message
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");

  try {
    // Add the current user message to message history
    messageHistory.push({
      role: "user",
      parts: [{ text: userMessage }]
    });
    // const newMessage = {
    //   content: userMessage,
    //   sender: "user",
    //   _id: sessionId
    // };
    // apiHistory.push(newMessage);
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: messageHistory,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // if (userMessage.toLowerCase().includes("thời tiết") || userMessage.toLowerCase().includes("weather")) {
    //   const weatherData = await fetchWeatherData("Hanoi");
    //   if (weatherData) {
    //     const weatherResponse = `Thời tiết hiện tại ở ${weatherData.location.name}, ${weatherData.location.region}: ${weatherData.current.temp_c}°C, ${weatherData.current.condition.text}.`;
    //     showTypingEffect(weatherResponse, textElement, incomingMessageDiv); 
    //     return; 
    //   }
    // }

    // Get the API response text, clean it, and show typing effect

    const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
    
    // const apiResponse = data?.candidates[0].content.parts[0].text
    //     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    //     .replace(/```(.*?)```/gs, '<div class="code-block">$1</div>') 
    //     .replace(/`(.*?)`/g, '<code>$1</code>') 
    //     .replace(/(\n)/g, '<br>');

    showTypingEffect(apiResponse, textElement, incomingMessageDiv); // Display typing effect
    messageHistory.push({ role: "model", parts: [{ text: apiResponse }] });
    // const repMessage = {
    //   content: apiResponse,
    //   sender: "model",
    //   _id: sessionId
    // };
    // apiHistory.push(repMessage);
    // renderChatHistory(apiHistory);

    // await saveChatHistoryToDB(userMessage, apiResponse, sessionId);
  } catch (error) {
    // Handle error and display message
    isResponseGenerating = false;
    textElement.innerText = error.message;
    textElement.parentElement.closest(".message").classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading"); // Remove loading state
  }
}

// Show a loading animation while waiting for the API response
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
}

// Copy message text to the clipboard
const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector(".text").innerText;

  navigator.clipboard.writeText(messageText);
  copyButton.innerText = "done"; // Show confirmation icon
  setTimeout(() => copyButton.innerText = "content_copy", 1000); // Revert icon after 1 second
}

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if(!userMessage || isResponseGenerating) return; // Exit if there is no message or response is generating

  isResponseGenerating = true;

  const html = `<div class="message-content">
                  <img class="avatar" src="images/user.jpg" alt="User avatar">
                  <p class="text"></p>
                </div>`;

  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  chatContainer.appendChild(outgoingMessageDiv);
  
  typingForm.reset(); // Clear input field
  document.body.classList.add("hide-header");
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  setTimeout(showLoadingAnimation, 500); // Show loading animation after a delay
}

// Toggle between light and dark themes
toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// Delete all chats from local storage when button is clicked
deleteChatButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("saved-chats");
    loadDataFromLocalstorage();
  }
});

// Set userMessage and handle outgoing chat when a suggestion is clicked
suggestions.forEach(suggestion => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText;
    handleOutgoingChat();
  });
});

// Prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
  e.preventDefault(); 
  handleOutgoingChat();
});

loadDataFromLocalstorage();

const fetchWeatherData = async (location) => {
  const weatherAPIKey = "1457182870784a7488b102639242810"; // Thay bằng API key của bạn
  const weatherAPIURL = `http://api.weatherapi.com/v1/current.json?key=${weatherAPIKey}&q=${location}`;

  try {
    const response = await fetch(weatherAPIURL);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error while retrieving weather data:", error);
    return null;
  }
};

// const saveChatHistoryToDB = async (userMessage, apiResponse, sessionId) => {
//   try {
//     const response = await fetch(DB_API_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ 
//         modelMessage: apiResponse,
//         userMessage: userMessage,
//         sessionId: sessionId,
//         time: new Date().toISOString()
//        }),
//     });

//     if (!response.ok) throw new Error("Failed to save chat history to database.");
//     console.log("Chat history saved successfully.");
//   } catch (error) {
//     console.error("Error saving chat history:", error.message);
//   }
// };

const renderChatHistory = (messages) => {
  const chatContainer = document.getElementById("chat-container");
  chatContainer.innerHTML = '';

  messages.forEach(message => {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");

      const html = `
          <div class="message-content">
              <img class="avatar" src="${message.sender === "user" ? 'images/user.jpg' : ''}" alt="${message.sender} avatar">
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


//write funtion fetch api get all message from /chat/:id
const fetchChatHistory = async (sessionId) => {
  try {
    const response = await fetch(`https://sl36qhn5-3000.asse.devtunnels.ms/chat/${sessionId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch chat history from database.");
    const data = await response.json();
    console.log("Chat history fetched successfully:", data);
    apiHistory = data;
    renderChatHistory(apiHistory);
    return data;
  } catch (error) {
    console.error("Error fetching chat history:", error.message);
    return null;
  }
  
};

getSessionId();


// Define the function to fetch suggestions from Gemini
const fetchSuggestionsFromGemini = async (messageHistory) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: messageHistory,
        prompt: "Provide suggestions for the next question the user might ask."
      }),
    });

    if (!response.ok) throw new Error("Failed to fetch suggestions from Gemini.");

    const data = await response.json();
    console.log(data);
    return data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1').split("\n").filter(Boolean);
  } catch (error) {
    console.error("Error fetching suggestions:", error.message);
    return [];
  }
};

const getCombinedSuggestions = async () => {
  const geminiSuggestions = await fetchSuggestionsFromGemini(messageHistory);

  renderSuggestions(geminiSuggestions);
};

const renderSuggestions = (suggestions) => {
  const suggestionContainer = document.getElementById("suggestion-container"); // Make sure this ID matches your HTML element
  suggestionContainer.innerHTML = ''; // Clear previous suggestions

  if (suggestions.length === 0) {
    const noSuggestionsDiv = document.createElement("div");
    noSuggestionsDiv.classList.add("no-suggestions");
    noSuggestionsDiv.innerText = "No suggestions available.";
    suggestionContainer.appendChild(noSuggestionsDiv);
    return; // Exit if there are no suggestions
  }

  suggestions.forEach(suggestion => {
    const suggestionDiv = document.createElement("div");
    suggestionDiv.classList.add("suggestion");

    // Set the text of the suggestion
    suggestionDiv.innerText = suggestion;

    // Add a click event to send the suggestion as a user message
    suggestionDiv.addEventListener("click", () => {
      sendUserMessage(suggestion); // Function to handle sending user messages
    });

    // Append the suggestion to the container
    suggestionContainer.appendChild(suggestionDiv);
  });
};

getCombinedSuggestions();
