import dotenv from 'dotenv';
import express from 'express';
import fetchuser from '../middleware/fetchuser.js';
import Ebook from '../model/Ebooks.js';

dotenv.config();

const router = express.Router();

// Route 1 : Add ebooks by using : POST "/editor/addebooks"
router.post('/addebooks', fetchuser, async (req, res) => {
    let success = false;

    if (req.user.type === "editor") {
        try {
            const ebook = await Ebook.create({
                name: req.body.name,
                authname: req.body.authname,
                published: req.body.published,
                ebooklink: req.body.ebooklink
            });

            success = true;

            return res.status(200).json({ success, message: "Book added successfully", ebook: ebook })
        }
        catch (err) {
            return res.status(400).json({ success: false, message: err.message })
        }
    }
    else {
        return res.status(500).json({ success: false, message: "You are not allowed to add!" })
    }
});

// Route 2 : Delete ebooks by using : DELETE "/editor/deleteebooks/:id"
router.delete('/deleteebooks/:id', fetchuser, async (req, res) => {
    let success = false;
    if (req.user.type === "editor") {
        try {
            let isEbook = await Ebook.findById(req.params.id);
            if (!isEbook) { return res.status(404).json({ success: false, message: "E-Book Not Found" }) };

            await Ebook.findByIdAndDelete(req.params.id);
            success = true;

            return res.status(200).json({ success, message: "E-Book deleted successfully" })
        }
        catch (err) {
            return res.status(500).json({ success: false, message: "Unable to delete E-books" });
        }
    }
    else {
        return res.status(200).json({ success: false, message: "You are not allowed to delete!" })
    }
});

// Route 3 : Delete ebooks by using : PUT "/editor/updateebooks/:id"
router.put('/updateebooks/:id', fetchuser, async (req, res) => {
    let success = false;
    if (req.user.type === "editor") {
        try {
            const { name, authname, published, ebooklink } = req.body;
            let isEbook = await Ebook.findById(req.params.id);
            if (!isEbook) { return res.status(404).json({ success: false, message: "E-Book Not Found" }) };

            const newBook = {}
            if (name) { newBook.name = name }
            if (authname) { newBook.authname = authname }
            if (published) { newBook.published = published }
            if (ebooklink) { newBook.ebooklink = ebooklink }

            const updatedEbook = await Ebook.findByIdAndUpdate(req.params.id, { $set: newBook }, { new: true });
            success = true;

            return res.status(200).json({ success, message: "E-Book has been updated!", data: updatedEbook })
        }
        catch (err) {
            return res.status(200).json({ success: false, message: "Unable to update E-books" });
        }
    }
    else {
        return res.status(200).json({ success: false, message: "You are not allowed to update!" })
    }
});

export default router;