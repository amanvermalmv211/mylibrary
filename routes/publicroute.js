import dotenv from 'dotenv';
import express from 'express';
import Ebook from '../model/Ebooks.js';
import Result from '../model/Results.js';

dotenv.config();

const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET;

// Route 1 : Retrive ebooks by using : GET "/user/getebooks"
router.get('/getebooks', async (req, res) => {
    let success = false;
    try {
        const ebooks = await Ebook.find();
        success = true;

        return res.status(200).json({ success, ebooks: ebooks })
    }
    catch (err) {
        return res.status(200).json({ success: false, message: "Unable to get E-books" });
    }
});

// Route 2 : Retrive results by using : GET "/user/getresults"
router.get('/getresults', async (req, res) => {
    let success = false;
    try {
        const results = await Result.find();
        success = true;

        return res.status(200).json({ success, results: results })
    }
    catch (err) {
        return res.status(200).json({ success: false, message: "Unable to get results" });
    }
});

export default router;