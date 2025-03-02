import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import OTPVerification from '../model/OTP.js';

import cron from 'node-cron';
import Student from '../model/Student.js';
import Libowner from '../model/Libowner.js';

dotenv.config();

cron.schedule('0 0 * * *', async () => {
    const currentDate = new Date();
    let libownerNotifications = {};

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'merilibrary.in@gmail.com',
            pass: process.env.MAIL_PASS
        }
    });

    try {
        const students = await Student.find({
            'subscriptionDetails.expiryDate': { $lt: currentDate },
            'subscriptionDetails.blocked': false
        })
            .populate('userId', 'email')
            .populate('subscriptionDetails.libraryId', 'libname userId floors');

        for (let student of students) {
            try {
                let updatedSubscriptions = [];
                let sendEmail = false;
                const studentEmail = student.userId?.email;
                if (!studentEmail) {
                    continue;
                }

                for (let subs of student.subscriptionDetails) {
                    try {
                        if (subs.expiryDate < currentDate && !subs.blocked) {
                            const expiryDate = new Date(subs.expiryDate);
                            const daysSinceExpiry = (currentDate - expiryDate) / (1000 * 60 * 60 * 24);

                            if (!subs.emailSentDate || (daysSinceExpiry >= 5 && daysSinceExpiry <= 6)) {
                                sendEmail = true;
                                subs.emailSentDate = currentDate;

                                const stdmailOptions = {
                                    from: 'merilibrary.in@gmail.com',
                                    to: studentEmail,
                                    subject: `Your Subscription at ${subs.libraryId.libname} has Expired!`,
                                    text: `Subscription Expired
                                    Hey! ${student.name}, your subscription expired on ${expiryDate.toDateString()}.
                                    Please renew your subscription to continue enjoying our services.
                                    Renew Now: merilibrary.in/student/profile
                                    ---------------------------------------------------
                                    If you have already renewed, please ignore this message.
                                    Best Regards, 
                                    meriLibrary Team 
                                    merilibrary.in`,
                                    html: `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; color: #ffffff;">
                                    <div style="max-width: 500px; margin: 20px auto; background: #1c1c1c; padding: 20px; border-radius: 10px; text-align: center;">
                                    <h2 style="color: #ff6b6b; margin-bottom: 10px;">Subscription Expired</h2>
                                    <p style="color: #d3d3d3; font-size: 14px;">Hey! ${student.name}, your subscription expired on <strong>${expiryDate.toDateString()}</strong>.</p>
                                    <p style="color: #d3d3d3; font-size: 14px;">Please renew your subscription to continue enjoying our services.</p>
                                    <a href="https://merilibrary.in/student/profile" style="display: inline-block; background: #6dd5ed; color: #121212; text-decoration: none; font-weight: bold; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">Renew Now</a>
                                    <hr style="border: 0; height: 1px; background: #444; margin: 20px 0;">
                                    <p style="font-size: 12px; color: #888;">If you have already renewed, please ignore this message.</p>
                                    <p style="font-size: 12px; color: #888;">Best Regards, <br> <strong>meriLibrary Team</strong> <br> <a href="https://merilibrary.in" style="color: #6dd5ed; text-decoration: none;">merilibrary.in</a></p>
                                    </div>
                                    </body>`
                                };
                                await transporter.sendMail(stdmailOptions);
                            }

                            const library = subs.libraryId;
                            if (library) {
                                try {
                                    const floor = library.floors?.[subs.idxFloor];
                                    const shift = floor?.shifts?.[subs.idxShift];
                                    const seat = shift?.numberOfSeats?.[subs.idxSeatSelected];

                                    if (seat?.isBooked && String(seat.student) === String(student._id)) {
                                        seat.isBooked = false;
                                        seat.student = null;
                                        await library.save();
                                    }
                                } catch (err) {
                                    console.log("Error updating library seat info:", err);
                                }
                            }

                            const ownerId = subs.libraryId?._id;
                            if (ownerId) {
                                if (!libownerNotifications[ownerId]) libownerNotifications[ownerId] = [];
                                libownerNotifications[ownerId].push({
                                    studentName: student.name,
                                    expiryDate: subs.expiryDate,
                                    seatDetails: `Floor ${subs.idxFloor}, Shift ${Number(subs.idxShift) + 1}, Seat ${Number(subs.idxSeatSelected) + 1}`
                                });
                            }

                            subs.blocked = daysSinceExpiry >= 7;
                        }
                        updatedSubscriptions.push(subs);
                    } catch (err) {
                        console.log("Error processing student subscription:", err);
                    }
                }

                student.subscriptionDetails = updatedSubscriptions;
                if (sendEmail) await student.save();
            } catch (err) {
                console.log("Error processing student:", err);
            }
        }

        for (const ownerId in libownerNotifications) {
            try {
                const owner = await Libowner.findById(ownerId).populate('userId', 'email');
                if (owner && owner.userId?.email) {
                    const ownmailOptions = {
                        from: 'merilibrary.in@gmail.com',
                        to: owner.userId.email,
                        subject: `Daily Subscription Expiry Report`,
                        text: `Subscription Expiry Notification (${owner.libname})
                        The following students' subscriptions have expired:
                        ${libownerNotifications[ownerId].map(s => 
                            `${s.studentName} | ${new Date(s.expiryDate).toDateString()} | ${s.seatDetails}`
                        ).join('\n')}
                        Please take the necessary actions to renew or remove these students.
                        Best Regards,  
                        meriLibrary Team  
                        merilibrary.in
                        `,
                        html: `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; color: #ffffff;">
                        <div style="max-width: 600px; margin: 20px auto; background: #1c1c1c; padding: 20px; border-radius: 10px; text-align: center;">
                        <h2 style="color: #ffffff; margin-bottom: 10px;">Subscription Expiry Notification (${owner.libname})</h2>
                        <p style="color: #d3d3d3; font-size: 14px; margin-bottom: 20px;">The following students' subscriptions have expired:</p>
                        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                        <tr>
                        <th style="border-bottom: 1px solid #444; padding: 8px; color: #6dd5ed; text-align: left;">Student</th>
                        <th style="border-bottom: 1px solid #444; padding: 8px; color: #6dd5ed; text-align: left;">Expiry Date</th>
                        <th style="border-bottom: 1px solid #444; padding: 8px; color: #6dd5ed; text-align: left;">Seat</th>
                        </tr>
                        ${libownerNotifications[ownerId].map(s => `
                            <tr>
                            <td style="border-bottom: 1px solid #444; padding: 8px; text-align: left;">${s.studentName}</td>
                            <td style="border-bottom: 1px solid #444; padding: 8px; text-align: left;">${new Date(s.expiryDate).toDateString()}</td>
                            <td style="border-bottom: 1px solid #444; padding: 8px; text-align: left;">${s.seatDetails}</td>
                            </tr>
                            `).join('')}
                            </table>
                            <hr style="border: 0; height: 1px; background: #444; margin: 20px 0;">
                            <p style="font-size: 12px; color: #888;">Please take the necessary actions to renew or remove these students.</p>
                            <p style="font-size: 12px; color: #888;">Best Regards, <br> <strong>meriLibrary Team</strong> <br> <a href="https://merilibrary.in" style="color: #6dd5ed; text-decoration: none;">merilibrary.in</a></p>
                            </div>
                            </body>`
                    };
                    await transporter.sendMail(ownmailOptions);
                }
            } catch (err) {
                console.log("Error sending email to library owner:", err);
            }
        }
    } catch (err) {
        console.log("Error fetching students from DB:", err);
    }
});

async function sendOTP(req, res) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'merilibrary.in@gmail.com',
            pass: process.env.MAIL_PASS
        }
    })

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const mailOptions = {
        from: 'amanvermalmv211@gmail.com',
        to: req.body.email,
        subject: 'Verify your email at merilibrary.in',
        text: `Thank You for Signing Up
        Enter this code below to verify your email: ${otp}
        This code will expire in 2 minutes. Do not share it with anyone.
        ---------------------------------------------------
        Your privacy is important to us. If you didn’t request this verification, please ignore this email.
        Best Regards, 
        merilibrary Team
        merilibrary.in`,
        html: `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; color: #ffffff;">
        <div style="max-width: 500px; margin: 20px auto; background: #1c1c1c; padding: 20px; border-radius: 10px; text-align: center;">
        <h2 style="color: #ffffff; margin-bottom: 10px;">Thank You for Signing Up</h2>
        <p style="color: #d3d3d3; font-size: 14px; margin-bottom: 20px;">Use this code to verify your email:</p>
        <div style="font-size: 36px; font-weight: bold; color: #6dd5ed; margin: 20px 0;">${otp}</div>
        <p style="color: #d3d3d3; font-size: 14px;">This code will expire in <strong>2 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border: 0; height: 1px; background: #444; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; margin-top: 10px;">Your privacy is important to us. If you didn’t request this verification, please ignore this email.</p>
        <p style="font-size: 12px; color: #888;">Best Regards, <br> <strong>meriLibrary Team</strong> <br> <a href="https://merilibrary.in" style="color: #6dd5ed; text-decoration: none;">merilibrary.in</a></p>
    </div>
</body>`
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
            message: err.message
        });
    }

}

export default sendOTP;