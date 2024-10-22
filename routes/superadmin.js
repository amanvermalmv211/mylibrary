import dotenv from 'dotenv';
import express from 'express';
import Admin from '../model/Superadmin.js';
import fetchuser from '../middleware/fetchuser.js';
import Libowner from '../model/Libowner.js';

dotenv.config();

const router = express.Router();

// Route 1 : Create user using : POST "/superadmin/getadmin"
router.get('/getadmin', fetchuser, async (req, res) => {
    let success = false;

    if(req.user.type !== "admin"){return res.status(500).json({success: false, message: "Not Allowed"})}

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

// Route 2 : Create user using : POST "/superadmin/getrequest/library"
router.get('/getrequest/library', fetchuser, async (req, res) => {
    let success = false;

    if(req.user.type !== "admin"){return res.status(500).json({success: false, message: "Not Allowed"})}

    try {
        let libdata = await Libowner.find({ isallowed: false });
        if (!libdata) {
            return res.status(400).json({ success, message: "There is no request!" })
        }

        console.log(typeof(libdata[0].shifts[0].numberOfSeats))

        res.status(200).json({ success: true, data: libdata })
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Unable to get requests!" });
    }

});

export default router;