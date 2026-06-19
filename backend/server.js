import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use(userRoutes);
app.use(postRoutes);
app.use(jobRoutes);

const start = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(9090, () => {
        console.log('Server running on port 9090');
    });
};

start();