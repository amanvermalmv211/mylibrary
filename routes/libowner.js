import dotenv from 'dotenv';
import express from 'express';
import Libowner from '../model/Libowner.js';
import fetchuser, { fetchIsAllowed } from '../middleware/fetchuser.js';

dotenv.config();

const router = express.Router();

// Route 1 : Create user using : POST "/libowner/getlibowner"
router.get('/getlibowner', fetchuser, async (req, res) => {
    let success = false;

    try {
        let libowner = await Libowner.findOne({ userId: req.user.id });
        if (!libowner) {
            return res.status(400).json({ success, message: "Libray owner not found" })
        }

        res.status(200).json({ success: true, data: libowner })

    }
    catch (err) {
        res.status(500).json({ success: false, message: "Internal server error occured" });
    }

});

// Route 2 : Create user using : POST "/libowner/updateprofile"
router.put('/updateprofile', fetchuser, async (req, res) => {
    let success = false;

    const libraryDetails = req.body;

    try {
        let library = await Libowner.findOne({ userId: req.user.id });
        if (!library) {
            return res.status(400).json({ success, message: "Libray owner not found" })
        }

        // Update library details
        if (libraryDetails.profileImg || libraryDetails.profileImg === 0) library.profileImg = libraryDetails.profileImg;
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

        // Save updated library data
        await library.save();

        res.status(200).json({ success: true, message: 'Library details updated successfully', data: library });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Internal server error occured" });
    }

});

// Route 3 : Route for admin to update library details :  PUT "/libowner/updatelibrary/:id"
router.put('/updatelibrary/:id', fetchuser, fetchIsAllowed, async (req, res) => {

    const libraryId = req.params.id;
    const libraryDetails = req.body;

    try {
        // Find library by ID
        const library = await Libowner.findById(libraryId);
        if (!library) {
            return res.status(404).json({ success: false, message: 'Library not found' });
        }

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
        
        // Save updated library data
        await library.save();
        
        res.status(200).json({ success: true, message: 'Library details updated successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error. Unable to update library details.' });
    }
});

export default router;