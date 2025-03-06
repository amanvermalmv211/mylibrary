import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import userauth from './routes/userauth.js';
import superadmin from './routes/superadmin.js';
import libowner from './routes/libowner.js';
import student from './routes/student.js';
import editorworks from './routes/editorworks.js';
import publicroute from './routes/publicroute.js';
import path from 'path';

const app = express();

app.use(cors());

app.use(express.json());

dotenv.config();

const __dirname = path.resolve(); // Get absolute directory path
const buildpath = path.join(__dirname, "../build"); // Point to React build folder
app.use(express.static(buildpath));

// app.get('/', (req, res)=>{
//     return res.status(234).send("Welcome to myLibrary backend services...");
// })

// Available Routes
app.use('/user/userauth', userauth);
app.use('/superadmin', superadmin);
app.use('/libowner', libowner);
app.use('/student', student);
app.use('/editor', editorworks);
app.use('/user', publicroute);

// Serve React frontend for any unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(buildpath, 'index.html'));
});

mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log("Connected successfully");
        app.listen(process.env.PORT, () => {
            console.log(`App is listenging to port: ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log(error)
    });