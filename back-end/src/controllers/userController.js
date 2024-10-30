//userController
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const errorHandler = require('../utils/errorHandler');
const dotenv = require("dotenv");



dotenv.config();
const secretKey = process.env.JWT_SECRET;

module.exports.login = async function(req, res) {
    const candidate = await User.findOne({email: req.body.email});
    console.log(req.body)    
    if(candidate) {
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password);
        if(passwordResult) {
            const token = jwt.sign({
                email: candidate.email,
                userId: candidate._id
            }, secretKey, {expiresIn: '12h'});
            // res save to cookie
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: 12 * 3600 * 1000,
                sameSite: "None", // Adjust as needed
                secure: true       // Only set to true if testing over HTTPS
            });
            res.status(200).json({
                token: `Bearer ${token}`
            });
        } else {
            res.status(401).json({
                message: 'Invalid password'
            });
        }
    } else {
        res.status(404).json({
            message: 'User with this email not found'
        });
    }
};

module.exports.register = async function(req, res) {
    console.log(req.body.email);
    
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }
    const candidate = await User.findOne({email: req.body.email});
    if(candidate) {
        res.status(409).json({
            message: 'This email is already in use'
        });
    } else {
        const salt = bcrypt.genSaltSync(10);
        const password = req.body.password;
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password, salt),
            fullName: req.body.fullName,
        });
        try {
            await user.save();
            res.status(201).json(user);
        } catch(e) {
            errorHandler(res, e);
        }
    }
};