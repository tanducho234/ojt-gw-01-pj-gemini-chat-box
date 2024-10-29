const mongoose = require('mongoose');

// Định nghĩa schema cho từng tin nhắn
const MessageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        enum: ['user', 'model'], // Chỉ chấp nhận giá trị 'user' hoặc 'model'
        required: true
    }
}); 
// Định nghĩa schema cho phiên trò chuyện
const ChatSessionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true
    },
    lastChatTime: {
        type: Date,
        default: Date.now
    },
    messages: [MessageSchema] // Mảng các tin nhắn
});

// Tạo model từ schema
const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);

module.exports = ChatSession;
