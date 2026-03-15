import express from 'express';
import cors from 'cors';
import dotenv  from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(userRoutes);

const start = async ()=>{
    const connection = await mongoose.connect(process.env.MONGO_URI);

    app.listen(9090, ()=>{
        console.log("server is running on port 9090")
    })
}

start();