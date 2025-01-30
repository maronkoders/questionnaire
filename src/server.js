import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import Assessment from './models/Assessment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

// MongoDB Connection
try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
        throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected Successfully');
} catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
}

// Middleware
app.use(express.static(join(__dirname, '../public')));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(join(__dirname, '../public/admin.html'));
});


// API Routes
app.post('/api/submit-assessment', async (req, res) => {
    try {
        const data = req.body;
        data.created_at = new Date().toISOString();
        const assessment = new Assessment(data);
        await assessment.save();
        res.status(200).json({success: true, message:'Survey has been saved'});
    } catch (error) {
        res.status(500).json({success: false, message: error.message });
    }
});


app.get('/api/get-assessments', async (req, res) => {
    try {
        const assessments = await Assessment.find();
        res.status(200).json({success: true, assessments});
    } catch (error) {
        res.status(500).json({success: false, message: error.message });
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Admin dashboard available at http://localhost:${port}/admin`);
}); 