import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import OTPVerification from '../model/OTP.js';

import cron from 'node-cron';
import Student from '../model/Student.js';
import Libowner from '../model/Libowner.js';
// import sgMail from '@sendgrid/mail';

dotenv.config();

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Run cron job daily at midnight
cron.schedule('0 0 * * *', async () => {
    const currentDate = new Date();
    let libownerNotifications = {};

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'amanvermalmv211@gmail.com',
            pass: process.env.MAIL_PASS
        }
    })

    const students = await Student.find({
        'subscriptionDetails.expiryDate': { $lt: currentDate },
        'subscriptionDetails.blocked': false
    })
        .populate('userId', 'email') // Ensure this correctly fetches email
        .populate('subscriptionDetails.libraryId', 'libname userId floors')
        .lean(); // Convert documents into plain objects for easier handling

    for (let student of students) {
        let updatedSubscriptions = [];
        let sendEmail = false;
        const studentEmail = student.userId.email;
        console.log("This is email of student: ", studentEmail);
        console.log(student.subscriptionDetails);

        console.log("Pass 1");

        for (let subs of student.subscriptionDetails) {
            if (subs.expiryDate < currentDate && !subs.blocked) {
                const expiryDate = new Date(subs.expiryDate);
                const daysSinceExpiry = (currentDate - expiryDate) / (1000 * 60 * 60 * 24);
                console.log("Pass 2");
                console.log(expiryDate);
                console.log(daysSinceExpiry);
                // const daysSinceExpiry = Math.floor((currentDate - subs.expiryDate) / (1000 * 60 * 60 * 24));

                // Check if last notification was sent more than 5 days ago
                if (!subs.emailSentDate || (daysSinceExpiry >= 5 && daysSinceExpiry <= 6)) {
                    sendEmail = true;
                    subs.emailSentDate = currentDate;

                    // const studentMsg = {
                    //     to: studentEmail,
                    //     from: 'amanvermalmv211@gmail.com',
                    //     subject: `Your Subscription at ${subs.libraryId.libname} has Expired!`,
                    //     text: `Your subscription expired on ${subs.expiryDate.toDateString()}. Please renew it to continue using the services.`
                    // };
                    // await sgMail.send(studentMsg);

                    console.log("Pass 3");

                    const stdmailOptions = {
                        from: 'amanvermalmv211@gmail.com',
                        to: studentEmail,
                        subject: `Your Subscription at ${subs.libraryId.libname} has Expired!`,
                        html: `<p>Your subscription expired on ${subs.expiryDate.toDateString()}. Please renew it to continue using the services.</p>`
                    }
                    console.log("Pass 4");
                    await transporter.sendMail(stdmailOptions);
                    console.log("Pass 5");
                }
                
                // Update `isBooked` field in Libowner Schema (Only for first-time expiry)
                const library = subs.libraryId;
                if (library) {
                    console.log("Pass 6");
                    const floor = library.floors[subs.idxFloor];
                    if (floor) {
                        console.log("Pass 7");
                        const shift = floor.shifts[subs.idxShift];
                        if (shift) {
                            console.log("Pass 8");
                            const seat = shift.numberOfSeats[subs.idxSeatSelected];
                            if (seat && seat.isBooked && String(seat.student) === String(student._id)) {
                                seat.isBooked = false; // Mark the seat as available
                                seat.student = null;   // Remove the student reference
                                await library.save();  // Save changes to the database
                                console.log("Pass 9");
                            }
                        }
                    }
                }

                // Collect notifications for library owners
                const ownerId = subs.libraryId.userId;
                if (!libownerNotifications[ownerId]) libownerNotifications[ownerId] = [];
                libownerNotifications[ownerId].push({
                    studentName: student.name,
                    expiryDate: subs.expiryDate,
                    seatDetails: `Floor ${subs.idxFloor}, Shift ${subs.idxShift}, Seat ${subs.idxSeatSelected}`
                });

                console.log("Pass 10")
                
                // If it's been more than 15 days, mark as blocked
                if (daysSinceExpiry < 7) {
                    updatedSubscriptions.push(subs);
                    console.log("Pass 11")
                } else {
                    subs.blocked = true; // Mark as blocked after 15 days
                    updatedSubscriptions.push(subs);
                    console.log("Pass 12")
                }
            } else {
                updatedSubscriptions.push(subs);
                console.log("Pass 13")
            }
        }
        
        // Update student subscriptions in DB
        student.subscriptionDetails = updatedSubscriptions;
        console.log("Pass 14")
        if (sendEmail) await student.save();
        console.log("Pass 15")
    }

    // Fetch library owners' emails and send notifications
    for (const ownerId in libownerNotifications) {
        console.log("Pass 16")
        const owner = await Libowner.findById(ownerId).populate('userId', 'email');
        console.log("Pass 17")

        if (owner) {
            // const ownerMsg = {
            //     to: owner.userId.email,
            //     from: 'amanvermalmv211@gmail.com',
            //     subject: `Daily Subscription Expiry Report`,
            //     text: `The following students' subscriptions have expired:\n${libownerNotifications[ownerId].map(
            //         s => `Student: ${s.studentName}, Expiry: ${s.expiryDate.toDateString()}, Seat: ${s.seatDetails}`
            //     ).join('\n')}`
            // };
            // await sgMail.send(ownerMsg);

            console.log("This is email of student: ", owner.userId.email);

            const ownmailOptions = {
                from: 'amanvermalmv211@gmail.com',
                to: owner.userId.email,
                subject: `Daily Subscription Expiry Report`,
                html: `<p>The following students' subscriptions have expired:\n${libownerNotifications[ownerId].map(
                    s => `Student: ${s.studentName}, Expiry: ${s.expiryDate.toDateString()}, Seat: ${s.seatDetails}`
                ).join('\n')}</p>`
            }
            await transporter.sendMail(ownmailOptions);
            console.log("Pass 18")
        }
    }

});


async function sendOTP(req, res) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'amanvermalmv211@gmail.com',
            pass: process.env.MAIL_PASS
        }
    })

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(otp);

    const mailOptions = {
        from: 'amanvermalmv211@gmail.com',
        to: req.body.email,
        subject: 'Verify Your Email(Testing Period)',
        html: `<p>OTP for verification at mylibrary.in is : <b>${otp}</b>.<br>This code is expires within 2 minutes.</p>`
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