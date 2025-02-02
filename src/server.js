import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Assessment from './models/Assessment.js';
import session from 'express-session';
import User from './models/User.js';
import { connectDB } from './utils/db.js';
import connectMongo from 'connect-mongo';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
await connectDB();

// Configure session store
const MongoStore = connectMongo.create({
    mongoUrl: process.env.NODE_ENV === 'development' ?  'mongodb://localhost:27017/questionnaire' : process.env.MONGODB_URI,
    collectionName: 'sessions'
});


// Trust the first proxy (necessary for secure cookies on Heroku)
app.set('trust proxy', 1);

// Middleware
app.use(express.static(join(__dirname, '../public')));
app.use('/assets', express.static(join(__dirname, '../src/assets')));
app.use(express.json());

// Session middleware with MongoDB store
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax' // Adjust as needed
    }
}));

// Add authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Add this middleware before your routes
app.use((req, res, next) => {
    // Get IP address
    req.clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.sendFile(join(__dirname, '../public/login.html'));
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile(join(__dirname, '../public/dashboard.html'));
});

// API Routes
app.post('/api/submit-assessment', async (req, res) => {
    try {
        const data = req.body;
        const deviceFingerprint = data.deviceFingerprint; // This will come from client
        const ipAddress = req.clientIp;

        // Check for existing submission within 24 hours
        const existingSubmission = await Assessment.findOne({
            deviceFingerprint,
            ipAddress,
            created_at: { 
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
            }
        });

        if (existingSubmission) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already submitted an assessment in the last 24 hours.' 
            });
        }

        // Add fingerprint and IP to the data
        data.deviceFingerprint = deviceFingerprint;
        data.ipAddress = ipAddress;
        data.created_at = new Date().toISOString();

        const assessment = new Assessment(data);
        await assessment.save();
        
        res.status(200).json({ 
            success: true, 
            message: 'Survey has been saved' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

app.get('/api/get-assessments', requireAuth, async (req, res) => {
    try {
        const assessments = await Assessment.find();
        res.status(200).json({ success: true, assessments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/responses', async (req, res) => {
    try {
        let responses = [];

        if (supabase) {
            const { data, error } = await supabase
                .from('survey_responses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            responses = data;
        }

        res.json(responses);
    } catch (error) {
        console.error('Error fetching responses:', error);
        res.status(500).json({ error: 'Failed to fetch responses' });
    }
});

app.delete('/api/responses/:id', async (req, res) => {
    try {
        if (supabase) {
            const { error } = await supabase
                .from('survey_responses')
                .delete()
                .eq('id', req.params.id);

            if (error) throw error;
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting response:', error);
        res.status(500).json({ error: 'Failed to delete response' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        req.session.user = {
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin
        };

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Admin dashboard available at http://localhost:${port}/login`);
}); 