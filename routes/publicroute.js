import dotenv from 'dotenv';
import express from 'express';
import fetchuser from '../middleware/fetchuser.js';
import Ebook from '../model/Ebooks.js';

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

export default router;