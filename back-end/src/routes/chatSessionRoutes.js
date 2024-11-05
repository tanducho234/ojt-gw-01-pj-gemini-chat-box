const express = require("express");
const router = express.Router();
const chatSessionController = require("../controllers/chatSessionController");

router.get("/export", chatSessionController.exportData);

//get all chat session by userid
router.get("/all", chatSessionController.getChatSessionByUserId);

router.get("/:id",chatSessionController.getChatSessionById); 

//rename chat session
router.put("/:id/", chatSessionController.renameChatSession);

// delete chat section
router.delete("/:id", chatSessionController.deleteChatSession);

//add new message to chat session
router.post("/", chatSessionController.addMessagesToChatSession);



module.exports = router;
