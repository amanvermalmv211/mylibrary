import dotenv from 'dotenv';
import express from 'express';
import Libowner from '../model/Libowner.js';
import fetchuser, { fetchIsAllowed } from '../middleware/fetchuser.js';
import RequestedLibrary from '../model/RequestedLibrary.js';
import Student from '../model/Student.js';

dotenv.config();

const router = express.Router();

// Route 1 : Get user using : GET "/libowner/getlibowner"
router.get('/getlibowner', fetchuser, fetchIsAllowed, async (req, res) => {
    let success = false;

    try {
        let libowner = await Libowner.findOne({ userId: req.user.id });

        if (!libowner) {
            return res.status(404).json({ success, message: "Library owner not found" });
        }

        libowner = await libowner.populate({
            path: 'floors.shifts.numberOfSeats.student',
            select: 'name contactnum aadharnum localarea city subscriptionDetails',
            populate: {
                path: 'subscriptionDetails.libraryId',
                match: { _id: libowner._id },
                select: 'libname'
            }
        });

        res.status(200).json({ success: true, data: libowner });

    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error occurred" });
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

        if (Array.isArray(libraryDetails.ytvideo)) {
            library.ytvideo = libraryDetails.ytvideo;
        }

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
router.get('/joinrequest/:id', fetchuser, fetchIsAllowed, async (req, res) => {
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
router.delete('/rejectrequest/:id', fetchuser, fetchIsAllowed, async (req, res) => {
    try {
        const request = await RequestedLibrary.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        request.status = "Rejected";
        await request.save();

        res.status(200).json({ success: true, message: 'Request is reject successfully.' });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Route 5 : Approve student's request using : POST "/libowner/approve-request"
router.post('/approve-request', fetchuser, fetchIsAllowed, async (req, res) => {
    try {
        const { requestId, subsDays } = req.body;

        const request = await RequestedLibrary.findById(requestId);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        const { studentId, libraryId, idxFloor, idxShift, idxSeatSelected } = request;

        const library = await Libowner.findById(libraryId);
        if (!library) {
            return res.status(404).json({ success: false, message: 'Library not found' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const seat = library.floors[idxFloor].shifts[idxShift].numberOfSeats[idxSeatSelected];
        if (seat.isBooked) {
            return res.status(400).json({ success: false, message: 'Oops! Seat is already booked' });
        }

        if (seat.gender !== student.gender) {
            return res.status(400).json({ success: false, message: `Gender mismatch: Seat is for ${seat.gender}s only` });
        }

        const activeSubscriptions = student.subscriptionDetails.filter(subs =>
            subs.expiryDate > new Date()
        );

        if (activeSubscriptions.length >= 2) {
            return res.status(400).json({ success: false, message: 'Student already has 2 active subscriptions' });
        }

        student.subscriptionDetails = student.subscriptionDetails.filter(subs =>
            subs.expiryDate > new Date()
        );

        if (!subsDays || isNaN(Date.parse(subsDays))) {
            return res.status(400).json({ success: false, message: "Invalid expiry date provided." });
        }

        const expiryDate = new Date(subsDays);

        const currentDate = new Date();
        if (expiryDate <= currentDate) {
            return res.status(400).json({ success: false, message: "Expiry date must be in the future." });
        }

        student.subscriptionDetails.push({
            libraryId,
            idxFloor: idxFloor,
            idxShift: idxShift,
            idxSeatSelected: idxSeatSelected,
            priceDetails: "30 Days",
            subscriptionDate: currentDate,
            expiryDate: expiryDate,
        });

        await student.save();

        seat.isBooked = true;
        seat.student = studentId;
        await library.save();

        await RequestedLibrary.findByIdAndDelete(requestId);

        const libData = await library.populate({
            path: 'floors.shifts.numberOfSeats.student',
            select: 'name contactnum aadharnum localarea city subscriptionDetails',
            populate: {
                path: 'subscriptionDetails.libraryId',
                match: { _id: library._id },
                select: 'libname'
            }
        });

        res.status(200).json({ success: true, message: 'Request approved successfully', data: libData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


export default router;