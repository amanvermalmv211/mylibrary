import dotenv from 'dotenv';
import express from 'express';
import fetchuser, { fetchIsStudent } from '../middleware/fetchuser.js';
import Student from '../model/Student.js';
import Libowner from '../model/Libowner.js';
import RequestedLibrary from '../model/RequestedLibrary.js';

dotenv.config();

const router = express.Router();

// Route 1 : Get student using : GET "/student/getstudent"
router.get('/getstudent', fetchuser, fetchIsStudent, async (req, res) => {
    let success = false;

    try {
        const student = await Student.findOne({ userId: req.user.id })
            .populate({
                path: 'subscriptionDetails.libraryId',
                select: 'libname contactnum libcontactnum googlemap'
            });

        if (!student) {
            return res.status(400).json({ success, message: "Student not found" })
        }

        res.status(200).json({ success: true, data: student })

    }
    catch (err) {
        res.status(500).json({ success: false, message: "GetStudent: Internal server error occured" });
    }

});

// Route 2 : Updation of profile using : POST "/student/updateprofile"
router.put('/updateprofile', fetchuser, fetchIsStudent, async (req, res) => {
    let success = false;

    const stdDetails = req.body;

    try {
        let std = await Student.findOne({ userId: req.user.id })
            .populate({
                path: 'subscriptionDetails.libraryId',
                select: 'libname contactnum libcontactnum googlemap'
            });
        if (!std) {
            return res.status(400).json({ success, message: "Student not found" })
        }

        // Update std details
        if (stdDetails.profileImg || stdDetails.profileImg === 0) std.profileImg = stdDetails.profileImg;
        if (stdDetails.name) std.name = stdDetails.name;
        if (stdDetails.contactnum) std.contactnum = stdDetails.contactnum;
        if (stdDetails.localarea) std.localarea = stdDetails.localarea;
        if (stdDetails.city) std.city = stdDetails.city;
        if (stdDetails.gender) std.gender = stdDetails.gender;

        // Save updated std data
        await std.save();

        res.status(200).json({ success: true, message: 'Students details updated successfully', data: std });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }

});

// Route 3 : Sending request using : POST "/student/request-library"
router.post('/request-library', fetchuser, fetchIsStudent, async (req, res) => {
    try {
        const { libraryId, studentId, gender, idxFloor, idxShift, idxSeatSelected } = req.body;

        // Fetch the library details
        const library = await Libowner.findById(libraryId);

        if (!library) {
            return res.status(404).json({ message: 'Library not found' });
        }

        const floor = library.floors[idxFloor];
        const selectedShift = floor.shifts[idxShift];
        const seat = selectedShift.numberOfSeats[idxSeatSelected];

        // Check if the seat is already booked in the selected shift
        if (seat.isBooked) {
            return res.status(400).json({ success: false, message: "Seat is already booked in the selected shift." });
        }

        if (seat.gender !== gender) {
            return res.status(400).json({ success: false, message: `Gender mismatch: Seat is for ${seat.gender}s only` });
        }

        // Check for overlapping shifts
        const selectedStartTime = parseInt(selectedShift.stTime, 10);
        const selectedEndTime = parseInt(selectedShift.endTime, 10);

        for (const [index, shift] of floor.shifts.entries()) {
            if (index !== idxShift) {
                const shiftStartTime = parseInt(shift.stTime, 10);
                const shiftEndTime = parseInt(shift.endTime, 10);

                const isOverlap =
                    (selectedStartTime >= shiftStartTime && selectedStartTime < shiftEndTime) ||
                    (selectedEndTime > shiftStartTime && selectedEndTime <= shiftEndTime) ||
                    (shiftStartTime >= selectedStartTime && shiftEndTime <= selectedEndTime);

                if (isOverlap && shift.numberOfSeats[idxSeatSelected].isBooked) {
                    return res.status(400).json({ success: false, message: `Seat is booked in another overlapping shift (Shift ${index + 1}).` });
                }
            }
        }

        // Check if the student has already requested the same seat
        const existingRequest = await RequestedLibrary.findOne({
            studentId,
            libraryId,
            idxFloor,
            idxShift,
            idxSeatSelected
        });

        if (existingRequest && existingRequest.status === "Pending") {
            return res.status(400).json({ success: false, message: 'You have already requested this seat.' });
        }
        else if (existingRequest && existingRequest.status === "Rejected") {
            return res.status(400).json({ success: false, message: 'You have already requested this seat but your request was rejected.' });
        }

        // Create a new request
        const request = new RequestedLibrary({
            studentId,
            libraryId,
            idxFloor,
            idxShift,
            idxSeatSelected,
        });

        await request.save();

        res.status(200).json({ success: true, message: "Seat request submitted successfully! Wait for approval." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Route 4 : Get requests using : GET "/student/getrequest"
router.get('/getrequest/:id', fetchuser, fetchIsStudent, async (req, res) => {
    try {
        const requests = await RequestedLibrary.find({ studentId: req.params.id }).populate('libraryId', 'libname contactnum').exec();

        if (requests.length > 0) {
            res.status(200).json({ success: true, data: requests });
        }
        else {
            res.status(400).json({ success: false });
        }

    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Route 5 : Delete request using : GET "/student/deleterequest"
router.delete('/deleterequest/:id', fetchuser, fetchIsStudent, async (req, res) => {
    try {
        const request = await RequestedLibrary.findById(req.params.id);

        if (!request) {
            return res.status(400).json({ success: false, message: 'Request not found' });
        }

        await RequestedLibrary.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Request deleted successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error occured!" });
    }
});

export default router;