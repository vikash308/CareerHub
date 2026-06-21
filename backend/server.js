import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    credentials: true
}));

app.use(express.json());

app.use(userRoutes);
app.use(postRoutes);
app.use(jobRoutes);

const start = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const PORT = process.env.PORT || 9090;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start();