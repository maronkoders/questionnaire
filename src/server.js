import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

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
app.post('/api/submit', async (req, res) => {
    try {
        const data = req.body;
        data.created_at = new Date().toISOString();
        
        // Store in Supabase if configured
        if (supabase) {
            const { error } = await supabase
                .from('survey_responses')
                .insert([data]);

            if (error) throw error;
        }
        
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error submitting response:', error);
        res.status(500).json({ error: 'Failed to submit response' });
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