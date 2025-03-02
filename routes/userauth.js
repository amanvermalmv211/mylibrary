import dotenv from 'dotenv';
import express from 'express';
import User from '../model/User.js';
import Editor from '../model/Editor.js';
import OTPVerification from '../model/OTP.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendOTP from './sendmail.js';
import Libowner from '../model/Libowner.js';
import Admin from '../model/Superadmin.js';
import Student from '../model/Student.js';

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

        if(req.body.type === "admin"){
            return res.status(400).json({ success: false, message: "Admin is already" })
        }

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
                type: user.type,
                isallowed: user.isallowed
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken, type: user.type, isallowed: user.isallowed, message: "User loged in successfully" });

    } catch (err) {
        res.status(500).send(err.message);
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
                await Student.create({
                    userId: user._id,
                    name: userdata.name,
                    gender: userdata.gender,
                    contactnum: userdata.contactnum,
                    aadharnum: userdata.aadharnum,
                    localarea: userdata.localarea,
                    city: userdata.city,
                    isReadTAC: true
                })
            }
            else if (user.type === "libowner") {
                // Creating new libowner
                await Libowner.create({
                    userId: user._id,
                    ownername: req.body.ownername,
                    contactnum: req.body.contactnum,
                    localarea: req.body.localarea,
                    city: req.body.city,
                    state: req.body.state,
                    pin: req.body.pin,
                    isReadTAC: true
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
            else if (user.type === "admin") {
                // Creating new admin
                await Admin.create({
                    userId: user._id,
                    name: req.body.name,
                })
            }

            await OTPVerification.findOneAndDelete({ email: userdata.email });

            const data = {
                user: {
                    id: user.id,
                    type: user.type,
                    isallowed: user.isallowed
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;

            return res.status(200).json({ success, authtoken, type: user.type, isallowed: user.isallowed, message: "OTP Verified Successfully!" });
        }
        else {
            return res.status(400).json({ success: false, message: "Time limit exceed. Please try again." });
        }

    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }

});

router.post('/forgotpassword', async (req, res) => {
    let success = false;

    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(500).json({ success, message: "User not found" });
        }

        sendOTP(req, res);

    }
    catch (err) {
        res.status(500).send({ success: false, message: "Internal server error occured." });
    }

});

router.post('/resetpassword', async (req, res) => {
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

            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(userdata.password, salt);

            const newUser = {
                password: secPass
            };

            let user = await User.findOneAndUpdate({ email: userdata.email }, { $set: newUser }, { new: true });

            await OTPVerification.findOneAndDelete({ email: userdata.email });

            const data = {
                user: {
                    id: user.id,
                    type: user.type,
                    isallowed: user.isallowed
                }
            }

            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            return res.status(200).json({ success, authtoken, type: user.type, isallowed: user.isallowed, message: "Password has been reset successfully!" });
        }
        else {
            return res.status(400).json({ success: false, message: "Time limit exceed. Please try again." });
        }

    }
    catch (err) {
        res.status(500).send("Internal server error occured.");
    }

});

export default router;