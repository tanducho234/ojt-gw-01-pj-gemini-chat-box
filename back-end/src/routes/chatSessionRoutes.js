const express = require("express");
const router = express.Router();
const chatSessionController = require("../controllers/chatSessionController");

// router.get("/:id",chatSessionController.getChatSessionById); 

// router.get("/export", chatSessionController.exportData);

// //get all chat by userid
// router.get("/all", chatSessionController.getChatSessionByUserId);
// //rename chat session
// router.put("/:id/rename", chatSessionController.renameChatSession);
// //delete chat session
// router.delete("/:id", chatSessionController.deleteChatSession);

module.exports = router;
