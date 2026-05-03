const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
    try {
        const { prompt, systemInstruction } = req.body;
        
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ text: "خطأ: مفتاح الـ API غير مفعّل في إعدادات Vercel." });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemInstruction}\n\nUser: ${prompt}` }] }]
            })
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            res.json({ text: data.candidates[0].content.parts[0].text });
        } else {
            res.json({ text: "عذراً، لم أستطع معالجة الرد حالياً." });
        }
    } catch (error) {
        res.status(500).json({ text: "حدث خطأ داخلي في الخادم." });
    }
});

module.exports = app;