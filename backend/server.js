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



// Connect to MongoDB using a serverless-friendly pattern
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }
    
    // Add serverless specific options
    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // Fail fast if we can't connect
        bufferCommands: false,
    });
    
    isConnected = true;
    console.log('Connected to MongoDB');
};

// Ensure DB is connected before handling any request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('MongoDB connection error in middleware:', err);
        return res.status(500).json({ 
            error: "Database connection failed",
            message: err.message 
        });
    }
});

app.use(userRoutes);
app.use(postRoutes);
app.use(jobRoutes);

// Only start the server locally (Vercel will use the exported app)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 9090;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export the Express API for Vercel
export default app;