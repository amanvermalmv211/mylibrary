import dotenv from 'dotenv';
import express from 'express';
import fetchuser, { fetchIsAdmin } from '../middleware/fetchuser.js';
import Student from '../model/Student.js';

dotenv.config();

const router = express.Router();

// Route 1 : Get admin details using : GET "/student/getstudent"
router.get('/getstudent', fetchuser, async (req, res) => {
    let success = false;

    try {
        let student = await Student.findOne({ userId: req.user.id });
        if (!student) {
            return res.status(400).json({ success, message: "Student not found" })
        }

        res.status(200).json({ success: true, data: student })

    }
    catch (err) {
        res.status(500).json({ success: false, message: "GetStudent: Internal server error occured" });
    }

});

// Route 2 : Create user using : POST "/student/updateprofile"
router.put('/updateprofile', fetchuser, async (req, res) => {
    let success = false;

    const stdDetails = req.body;

    try {
        let std = await Student.findOne({ userId: req.user.id });
        if (!std) {
            return res.status(400).json({ success, message: "Student not found" })
        }

        // Update std details
        if (stdDetails.profileImg || stdDetails.profileImg === 0) std.profileImg = stdDetails.profileImg;
        if (stdDetails.name) std.name = stdDetails.name;
        if (stdDetails.contactnum) std.contactnum = stdDetails.contactnum;
        if (stdDetails.address) std.address = stdDetails.address;
        if (stdDetails.gender) std.gender = stdDetails.gender;

        // Save updated std data
        await std.save();

        res.status(200).json({ success: true, message: 'Students details updated successfully', data: std });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Internal server error occured" });
    }

});

export default router;