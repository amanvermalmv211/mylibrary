import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import OTPVerification from '../model/OTP.js';

dotenv.config();

async function sendOTP(req, res) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'amanvermalmv211@gmail.com',
            pass: process.env.MAIL_PASS
        }
    })

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const mailOptions = {
        from: 'amanvermalmv211@gmail.com',
        to: req.body.email,
        subject: 'Verify Your Email(Testing Period)',
        html: `<p>OTP for verification at cograd.in is : <b>${otp}</b>.<br>This code is expires within 2 minutes.</p>`
    }

    try {
        // Securing OTP
        const salt = await bcrypt.genSalt(10);
        const secOTP = await bcrypt.hash(otp, salt);

        let user = await OTPVerification.findOne({ email: req.body.email });
        if (user) {
            const currDate = new Date();

            const newOTP = {
                email: req.body.email,
                otp: secOTP,
                timestamp: new Date(currDate.getTime())
            }

            await OTPVerification.findOneAndUpdate({ email: req.body.email }, { $set: newOTP }, { new: true });
            await transporter.sendMail(mailOptions);

            return res.status(201).json({
                success: true,
                message: "OTP has been send successfully"
            });
        }

        await OTPVerification.create({
            email: req.body.email,
            otp: secOTP,
        });
        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            success: true,
            message: "OTP has been send successfully"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error occured, Please try again!"
        });
    }

}

export default sendOTP;