import dotenv from 'dotenv';
import express from 'express';
import Admin from '../model/Superadmin.js';
import fetchuser, { fetchIsAdmin } from '../middleware/fetchuser.js';
import Libowner from '../model/Libowner.js';
import User from '../model/User.js';

dotenv.config();

const router = express.Router();

// Route 1 : Get admin details using : GET "/superadmin/getadmin"
router.get('/getadmin', fetchuser, fetchIsAdmin, async (req, res) => {
    let success = false;

    try {
        let admin = await Admin.findOne({ userId: req.user.id });
        if (!admin) {
            return res.status(400).json({ success, message: "Admin not found" })
        }

        res.status(200).json({ success: true, data: admin })

    }
    catch (err) {
        res.status(500).json({ success: false, message: "GetAdmin: Internal server error occured" });
    }

});

// Route 2 : Get requested libraries using : GET "/superadmin/getrequest/library"
router.get('/getrequest/library', fetchuser, fetchIsAdmin, async (req, res) => {
    let success = false;

    try {
        let libdata = await Libowner.find({ isallowed: false });
        if (!libdata) {
            return res.status(400).json({ success, message: "There is no request!" })
        }

        res.status(200).json({ success: true, data: libdata })
    }
    catch (err) {
        res.status(500).json({ success: false, message: "GetRequest: Unable to get requests!" });
    }

});

// Route 3 : Get all libraries using : GET "/superadmin/getalllibrary"
router.get('/getalllibrary', fetchuser, fetchIsAdmin, async (req, res) => {
    let success = false;

    try {
        let alllib = await Libowner.find({ isallowed: true });
        if (!alllib) {
            return res.status(400).json({ success, message: "There is no Library!" })
        }

        res.status(200).json({ success: true, data: alllib })
    }
    catch (err) {
        res.status(500).json({ success: false, message: "GetRequest: Unable to get Library!" });
    }

});

// Route 4 : Route for admin to update library details :  PUT "/superadmin/updatelibrary/:id"
router.put('/updatelibrary/:id', fetchuser, fetchIsAdmin, async (req, res) => {

    const libraryId = req.params.id;
    const libraryDetails = req.body;

    try {
        // Find library by ID
        const library = await Libowner.findById(libraryId);
        if (!library) {
            return res.status(404).json({ success: false, message: 'Library not found' });
        }

        // Update library details
        if (libraryDetails.ownername) library.ownername = libraryDetails.ownername;
        if (libraryDetails.libname) library.libname = libraryDetails.libname;
        if (libraryDetails.contactnum) library.contactnum = libraryDetails.contactnum;
        if (libraryDetails.libcontactnum) library.libcontactnum = libraryDetails.libcontactnum;
        if (libraryDetails.aadharnum) library.aadharnum = libraryDetails.aadharnum;
        if (libraryDetails.localarea) library.localarea = libraryDetails.localarea;
        if (libraryDetails.city) library.city = libraryDetails.city;
        if (libraryDetails.state) library.state = libraryDetails.state;
        if (libraryDetails.pin) library.pin = libraryDetails.pin;
        if (libraryDetails.googlemap) library.googlemap = libraryDetails.googlemap;

        // Update shifts if provided
        if (Array.isArray(libraryDetails.shifts)) {
            library.shifts = libraryDetails.shifts.map((shift) => ({
                stTime: shift.stTime || '7',
                endTime: shift.endTime || '12',
                price: shift.price || 700,
                discountPrice: shift.discountPrice || 500,
                numberOfSeats: shift.numberOfSeats ?
                    shift.numberOfSeats.map(seat => ({
                        student: seat.student || null,
                        gender: seat.gender || 'boy',
                        isBooked: seat.isBooked || false
                    })) : Array(80).fill({
                        student: null,
                        gender: 'boy',
                        isBooked: false
                    })
            }));
        }

        // Mark the library as allowed to be functional.
        library.isallowed = true;

        // Save updated library data
        await library.save();

        const newUser = {}
        newUser.isallowed = true;

        await User.findByIdAndUpdate(library.userId, { $set: newUser }, { new: true });

        res.status(200).json({ success: true, message: 'Library details updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error. Unable to update library details.' });
    }
});

export default router;