//chatSessionController
const { validationResult } = require("express-validator");
const User = require("../models/user");
const errorHandler = require("../utils/errorHandler");
const dotenv = require("dotenv");
const ChatSession = require("../models/ChatSession");

module.exports.getChatSessionById = async (req, res) => {
  try {
    const chatSession = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.user.userId, // Ensure the session belongs to the authenticated user
    });
    if (!chatSession) {
      return res.status(404).json({ message: "Chat session not found" });
    }
    const messages = chatSession.messages.map(msg => ({
      content: msg.content,
      sender: msg.sender
    }));
    res.status(200).json(messages);
  } catch (e) {
    return res.status(404).json({ message: "loi j do" });
    // errorHandler(res, e);
  }
};

module.exports.addMessagesToChatSession = async (req, res) => {
  try {
    // Extract data from the request body
    const { modelMessage, userMessage, sessionId } = req.body;
    if (!userMessage || !modelMessage) {
      return res.status(400).json({ message: "Invalid input data" });
    }
    // Create new messages based on the provided input
    const newMessages = [
      { content: userMessage, sender: "user" },
      { content: modelMessage, sender: "model" },
    ];

    if (sessionId) {
      console.log("aaaaa");

      // Find the chat session by ID and update it
      const updatedChatSession = await ChatSession.findByIdAndUpdate(
        sessionId, // Use sessionId from the request body
        {
          $push: { messages: { $each: newMessages } }, // Add new messages
          lastChatTime: new Date().toISOString(), // Update lastChatTime
        },
        { new: true, runValidators: true } // Return the updated document and run validators
      );
      if (!updatedChatSession)
        return res.status(404).json({ message: "Chat session not found" });
      return res
        .status(200)
        .json({ message: "Messages added to chat session" });
    } else {
      // Create a new chat session if sessionId is not provided
      const newChatSession = new ChatSession({
        name: userMessage, // You can customize the session name
        userId: req.user.userId, // Assuming you want to include userId in the request body
        lastChatTime: new Date().toISOString(),
        messages: newMessages,
      });

      const savedChatSession = await newChatSession.save();
      console.log("Created new chat session:", savedChatSession);
      return res.status(201).json({
        message: "New chat session created",
        sessionId: savedChatSession._id,
      });
    }
  } catch (e) {
    console.error("Error:", e);
    return res.status(404).json({ message: "Chat session not found" });
  }
};

//getChatSessionByUserId
module.exports.getChatSessionByUserId = async (req, res) => {
  try {
    const chatSessions = await ChatSession.find(
      { userId: req.user.userId },
      "name _id lastChatTime"
    ).sort({ lastChatTime: -1 }); // Sort by lastChatTime in descending order

    res.status(200).json(chatSessions);
  } catch (e) {
    console.error("Error:", e);
    return res.status(404).json({ message: "failed getChatSessionByUserId" });
  }
};

module.exports.renameChatSession = async (req, res) => {
  try {
    const { name } = req.body; // Extract the new name from the request body

    // Validate the input
    if (!name) {
      return res.status(400).json({ message: "New name is required" });
    }

    const updatedChatSession = await ChatSession.findByIdAndUpdate(
      req.params.id,
      { name: name }, // Update the chat session's name
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    if (!updatedChatSession) {
      return res.status(404).json({ message: "Chat session not found" });
    }

    res.status(200).json({
      message: "Chat session renamed successfully",
      updatedChatSession,
    });
  } catch (e) {
    console.error("Error:", e);
    return res.status(404).json({ message: "failed renameChatSession" });
  }
};

// Delete chat session
module.exports.deleteChatSession = async (req, res) => {
  try {
    const deletedChatSession = await ChatSession.findByIdAndDelete(
      req.params.id
    );

    if (!deletedChatSession) {
      return res.status(404).json({ message: "Chat session not found" });
    }

    res.status(200).json({ message: "Chat session deleted successfully" });
  } catch (e) {
    console.error("Error:", e);
    return res.status(404).json({ message: "failed deleteChatSession" });  }
};
