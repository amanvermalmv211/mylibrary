import dotenv from 'dotenv';
import express from 'express';
import Libowner from '../model/Libowner.js';
import fetchuser, { fetchIsAllowed } from '../middleware/fetchuser.js';
import RequestedLibrary from '../model/RequestedLibrary.js';

dotenv.config();

const router = express.Router();

// Route 1 : Get user using : GET "/libowner/getlibowner"
router.get('/getlibowner', fetchuser, fetchIsAllowed, async (req, res) => {
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

// Route 2 : Update user using : PUT "/libowner/updateprofile"
router.put('/updateprofile', fetchuser, fetchIsAllowed, async (req, res) => {
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

        if (Array.isArray(libraryDetails.floors)) {
            library.floors = libraryDetails.floors;
        }
        await library.save();

        res.status(200).json({ success: true, message: 'Library details updated successfully', data: library });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Internal server error occured" });
    }
});

// Route 3 : Get student's request using : GET "/libowner/joinrequest"
router.get('/joinrequest/:id', async (req, res) => {
    try {
        const requests = await RequestedLibrary.find({ libraryId: req.params.id, status: "Pending" }).populate('studentId', 'name gender city contactnum').exec();

        if (requests.length > 0) {
            res.status(200).json({ success: true, message: 'Library requests fetched successfully.', data: requests });
        }
        else {
            res.status(400).json({ success: false, message: 'There is no request' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: `backend error ${error.message}` });
    }
});

// Route 4 : Reject student's request using : DELETE "/libowner/rejectrequest"
router.delete('/rejectrequest', async (req, res) => {
    try {
        const data = req.body.data;
        const requests = await RequestedLibrary.findOne({ libraryId: data.libraryId, studentId: data.studentId, idxFloor: data.idxFloor, idxShift: data.idxShift, idxSeatSelected: data.idxSeatSelected });

        if (!requests) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        
        requests.status = "Rejected";
        await requests.save();

        res.status(200).json({ success: true, message: 'Request is reject successfully.' });

    } catch (error) {
        res.status(500).json({ success: false, message: `backend error ${error.message}` });
        console.log(error.message)
    }
});

export default router;