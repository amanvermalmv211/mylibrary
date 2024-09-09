import dotenv from 'dotenv';
import express from 'express';
import fetchuser from '../middleware/fetchuser.js';
import Ebook from '../model/Ebooks.js';

dotenv.config();

const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET;

// Route 1 : Add ebooks by using : POST "/editor/addebooks"
router.post('/addebooks', fetchuser, async (req, res) => {
    let success = false;

    if (req.user.type === "editor") {
        try {
            await Ebook.create({
                name: req.body.name,
                authname: req.body.authname,
                published: req.body.published,
                ebooklink: req.body.ebooklink
            });

            success = true;

            return res.status(200).json({ success, message: "Book added successfully" })
        }
        catch (err) {
            return res.status(200).json({ success: false, message: err.message })
        }
    }
});

export default router;