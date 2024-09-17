import dotenv from 'dotenv';
import express from 'express';
import User from '../model/User.js';
import Editor from '../model/Editor.js';
import OTPVerification from '../model/OTP.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendOTP from './sendmail.js';
import Libowner from '../model/Libowner.js';

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
                password: secPass,
                type: req.body.type
            }
            await User.findOneAndUpdate({ email: req.body.email }, { $set: newUser }, { new: true });
            sendOTP(req, res);
            return;
        }

        // Creating new User
        user = await User.create({
            email: req.body.email,
            password: secPass,
            type: req.body.type
        });

        sendOTP(req, res);
    }
    catch (err) {
        res.status(500).send("Internal server error occured.");
    }

});

// Route 2 : Authanticate an User using : POST "/user/userauth/loginuser".
router.post('/loginuser', async (req, res) => {
    let success = false;

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user || !user.isverified) {
            return res.status(400).json({ success, message: "User doesn't exists" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, message: "Password do not match!" });
        }

        const data = {
            user: {
                id: user.id,
                type: user.type
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken, type: user.type, message: "User loged in successfully" });

    } catch (err) {
        res.status(500).send("Internal server error occured.");
    }

});

// Route 3 : Verify OTP and User : POST "/user/userauth/verifyotp"
router.post('/verifyotp', async (req, res) => {
    let success = false;
    const userdata = req.body;

    try {
        // check whether the user with the email exists already.
        let userotp = await OTPVerification.findOne({ email: userdata.email });
        if (!userotp) {
            return res.status(400).json({ success, message: "User doesn't exist." })
        }

        const currDate = new Date();

        if (currDate.getTime() <= (userotp.timestamp + 120000)) {
            const otpCompare = await bcrypt.compare(userdata.otp, userotp.otp);
            if (!otpCompare) {
                return res.status(400).json({ success, message: "OTP does not matched." });
            }

            const newUser = {};
            newUser.isverified = true;

            let user = await User.findOneAndUpdate({ email: userdata.email }, { $set: newUser }, { new: true });

            if (user.type === "student") {
                // Creating new student
                await Editor.create({
                    userId: user._id,
                    name: req.body.name,
                    contactnum: req.body.contactnum
                })
            }
            else if (user.type === "libowner") {
                // Creating new owner
                await Libowner.create({
                    userId: user._id,
                    name: req.body.name,
                    contactnum: req.body.contactnum
                })
            }
            else if (user.type === "editor") {
                // Creating new editor
                await Editor.create({
                    userId: user._id,
                    name: req.body.name,
                    contactnum: req.body.contactnum
                })
            }

            await OTPVerification.findOneAndDelete({ email: userdata.email });

            const data = {
                user: {
                    id: user.id,
                    type: user.type
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            return res.status(200).json({ success, authtoken, type: user.type, message: "OTP Verified Successfully!" });
        }
        else {
            return res.status(400).json({ success: false, message: "Time limit exceed. Please try again."});
        }

    }
    catch (err) {
        res.status(500).send("Internal server error occured.");
    }

});

export default router;