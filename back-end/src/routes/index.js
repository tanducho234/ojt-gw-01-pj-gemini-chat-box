// index.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const userRoutes = require('./userRoutes');
const loginRoutes = require('./loginRoutes');
const registerRoutes = require('./registerRoutes');
const chatRoutes = require('./chatSessionRoutes');


// Add routes to the router
router.use('/register', registerRoutes);
router.use('/login', loginRoutes);
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

router.use('/users', authMiddleware, userRoutes);
//chatbox route
router.use('/chat',authMiddleware, chatRoutes);
//simple /root route
router.get('/', (req, res) => {
    console.log('someone');
    res.send('Hello, This api is running on TanHo laptop!');
});



module.exports = router;
