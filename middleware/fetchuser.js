import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const fetchIsAdmin = async (req, res, next)=>{
    try {
        if(req.user.type === "admin"){
            next();
            return;
        }
        else{
            return res.status(500).json({ success: false, message: "Not Allowed: Admin Only" })
        }
    } catch (error) {
        res.status(401).json({success: false, message: "Server Error: Try again later!"});
    }

}

export const fetchIsStudent = async (req, res, next)=>{
    try {
        if(req.user.type === "student"){
            next();
            return;
        }
        else{
            return res.status(500).json({ success: false, message: "Not Allowed: Student Only" })
        }
    } catch (error) {
        res.status(401).json({success: false, message: "Server Error: Try again later!"});
    }

}

export const fetchIsAllowed = async (req, res, next)=>{
    try {
        if(req.user.type === "editor"){
            if(!req.user.isallowed){
                return res.status(401).json({success: false, message: "Currently you are not allowed to perform any actions"});
            }
            next();
        }
        else if(req.user.type === "libowner"){
            if(!req.user.isallowed){
                return res.status(401).json({success: false, message: "Currently you are not allowed!"});
            }
            next();
        }
        else{
            return res.status(500).json({ success: false, message: "You are not allowed to perform any action" })
        }
    } catch (error) {
        res.status(401).json({success: false, message: "Server Error: Try again later!"});
    }

}

const fetchuser = (req, res, next)=>{
    const token = req.header('authtoken');
    if(!token){
        return res.status(401).json({success: false, message: "Please authenticate using a valid token"});
    }
    
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).json({success: false, message: "Please authenticate using a valid token"});
    }

}

export default fetchuser;