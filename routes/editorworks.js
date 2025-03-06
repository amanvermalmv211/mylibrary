import dotenv from 'dotenv';
import express from 'express';
import Ebook from '../model/Ebooks.js';
import Result from '../model/Results.js';
import fetchuser, { fetchIsAllowed } from '../middleware/fetchuser.js';
import Editor from '../model/Editor.js';

dotenv.config();

const router = express.Router();

// Route 1 : Add ebooks by using : POST "/editor/addebooks"
router.post('/addebooks', fetchuser, fetchIsAllowed, async (req, res) => {
    let success = false;
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
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
});

// Route 2 : Delete ebooks by using : DELETE "/editor/deleteebooks/:id"
router.delete('/deleteebooks/:id', fetchuser, fetchIsAllowed, async (req, res) => {
    let success = false;
    try {
        let isEbook = await Ebook.findById(req.params.id);
        if (!isEbook) { return res.status(404).json({ success: false, message: "E-Book Not Found" }) };

        await Ebook.findByIdAndDelete(req.params.id);
        success = true;

        return res.status(200).json({ success, message: "E-Book deleted successfully" })
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Route 3 : Update ebooks by using : PUT "/editor/updateebooks/:id"
router.put('/updateebooks/:id', fetchuser, fetchIsAllowed, async (req, res) => {
    let success = false;
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
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Route 4 : Add result by using : POST "/editor/addapp"
router.post('/addapp', fetchuser, fetchIsAllowed, async (req, res) => {
    let success = false;
    try {
        const result = await Result.create({
            papername: req.body.papername,
            appname: req.body.appname,
            formlink: req.body.formlink,
            youtubelink: req.body.youtubelink,
            endformdate: req.body.endformdate
        });

        success = true;

        return res.status(200).json({ success, message: "Application added successfully!", result: result })
    }
    catch (err) {
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
});

// Route 5 : Delete results by using : DELETE "/editor/deleteapp/:id"
router.delete('/deleteapp/:id', fetchuser, fetchIsAllowed, async (req, res) => {
    let success = false;
    try {
        let isApp = await Result.findById(req.params.id);
        if (!isApp) { return res.status(404).json({ success: false, message: "Application is not found" }) };

        await Result.findByIdAndDelete(req.params.id);
        success = true;

        return res.status(200).json({ success, message: "Application deleted successfully" })
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Route 6 : Update results by using : PUT "/editor/updateapp/:id"
router.put('/updateapp/:id', fetchuser, fetchIsAllowed, async (req, res) => {
    let success = false;
    try {
        const { papername, appname, formlink, youtubelink, endformdate, expirydate } = req.body;
        const isApp = await Result.findById(req.params.id);
        if (!isApp) { return res.status(404).json({ success: false, message: "Application is not found" }) };

        const newApp = {}
        if (papername) { newApp.papername = papername }
        if (appname) { newApp.appname = appname }
        if (formlink) { newApp.formlink = formlink }
        if (youtubelink) { newApp.youtubelink = youtubelink }
        if (endformdate) { newApp.endformdate = endformdate }
        if (expirydate) { newApp.expirydate = expirydate }

        const updatedApp = await Result.findByIdAndUpdate(req.params.id, { $set: newApp }, { new: true });
        success = true;

        return res.status(200).json({ success, message: "Application has been updated!", data: updatedApp })
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Route 7 : Get Editor by using : GET "/editor/profile"
router.get('/profile', fetchuser, async (req, res) => {
    let success = false;
    try {
        const isEditor = await Editor.findOne({userId: req.user.id});
        if (!isEditor) { return res.status(404).json({ success: false, message: "Editor is not found" }) };
        
        success = true;

        return res.status(200).json({ success, data: isEditor })
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Unable to fetch!" });
    }
});

export default router;