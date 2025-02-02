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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
// Connect to MongoDB
await connectDB();

// Configure session store
const MongoStore = connectMongo.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/questionnaire',
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
        data.created_at = new Date().toISOString();
        const assessment = new Assessment(data);
        await assessment.save();
        res.status(200).json({ success: true, message: 'Survey has been saved' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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