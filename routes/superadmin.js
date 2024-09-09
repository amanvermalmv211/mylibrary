import dotenv from 'dotenv';
import express from 'express';
import User from '../model/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendOTP from './sendmail.js';
import fetchuser from '../middleware/fetchuser.js';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;


// Route 1 : Create user using : POST "/user/userauth/createuser"
router.post('/createuser', async (req, res) => {
    let success = false;

    try {
        // Creating secure password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // check whether the user with the email exists already.
        let user = await User.findOne({ email: req.body.email });
        if (user && user.isverified) {
            return res.status(400).json({ success, message: "Sorry a user with this email already exists" })
        }
        else if (user && !user.isverified) {
            const newUser = {
                name: req.body.name,
                password: secPass
            }
            await User.findOneAndUpdate({ email: req.body.email }, { $set: newUser }, { new: true });
            sendOTP(req, res);
            return;
        }

        // Creating new Admin
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            type: req.body.type,
            isverified: false
        });

        sendOTP(req, res);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Internal server error occured.");
    }

});


// Route 2 : Authanticate an User using : POST "/user/userauth/loginuser".
router.post('/loginuser', async (req, res) => {
    let success = false;

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, message: "User doesn't exists" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, message: "Password do not match!" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal server error occured.");
    }

});

// Route 3 : Verify OTP and User : POST "/user/userauth/verifyotp"
router.post('/checking', fetchuser, async (req, res) => {
    
    return res.json({ success: true });;
});

export default router;