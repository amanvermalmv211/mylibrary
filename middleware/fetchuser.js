import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Editor from '../model/Editor.js';
import Libowner from '../model/Libowner.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const fetchIsAllowed = async (req, res, next)=>{
    try {
        if(req.user.type === "editor"){
            const isEditor = await Editor.findOne({ userId: req.user.id })
            if(!isEditor){
                return res.status(401).send({message: "Editor not found"});
            }

            if(!isEditor.isallowed){
                return res.status(401).send({success: false, message: "You are not allowed"});
            }

            next();
        }
        else if(req.user.type === "libowner"){
            const isLibOwner = await Libowner.findOne({ userId: req.user.id })
            if(!isLibOwner){
                res.status(401).send({message: "Editor not found"});
            }

            if(!isLibOwner.isallowed){
                res.status(401).send({message: "Currently you are not allowed"});
            }

            next();
        }
        else{
            return res.status(500).json({ success: false, message: "You are not allowed to perform any action" })
        }
    } catch (error) {
        res.status(401).send({error: "Currently you are not allowed to perform any operation"});
    }

}

const fetchuser = (req, res, next)=>{
    const token = req.header('authtoken');
    if(!token){
        return res.status(401).send({success: false, message: "Please authenticate using a valid token"});
    }
    
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).send({success: false, message: "Please authenticate using a valid token"});
    }

}

export default fetchuser;