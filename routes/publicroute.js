import Fuse from 'fuse.js';
import dotenv from 'dotenv';
import express, { query } from 'express';
import Ebook from '../model/Ebooks.js';
import Result from '../model/Results.js';
import Libowner from '../model/Libowner.js';

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

// Route 3 : Retrive results by using : GET "/user/getresults"
router.post('/save/contactdetails', async (req, res) => {
    try {
        return res.status(200).json({ success: true, message: "Contact details saved successfully" })
    }
    catch (err) {
        return res.status(200).json({ success: false, message: "Unable to get results" });
    }
});

// Route 4 : Retrive library by using : GET "/user/search/library"
router.get('/searchlib', async (req, res) => {
    try {
        const { libname, localarea, city } = req.query;
        
        const libraries = await Libowner.find({ isallowed: true });
        
        const searchTerms = {};
        if (libname) searchTerms.libname = libname;
        if (localarea) searchTerms.localarea = localarea;
        if (city) searchTerms.city = city;
        
        let results = libraries;
        for (const [key, value] of Object.entries(searchTerms)) {
            if (value.trim()) {
                const fuseSubset = new Fuse(results, { keys: [key], threshold: 0.3 });
                results = fuseSubset.search(value).map(item => item.item);
            }
        }
        
        if (results.length > 0) {
            return res.status(200).json({ success: true, data: results });
        } else {
            return res.status(404).json({ success: false, message: "No libraries found" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;