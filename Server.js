const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// مفتاح الـ API سيتم قراءته من إعدادات Vercel عند النشر
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""; 

app.post('/api/chat', async (req, res) => {
    const { prompt, systemInstruction, isJson } = req.body;
    
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "مفتاح API غير معدّ. يرجى إعداده في لوحة تحكم Vercel." });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
    
    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        ...(isJson && { generationConfig: { responseMimeType: "application/json" } })
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return res.status(500).json({ error: data.error.message });
        }
        
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        res.json({ text });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "خطأ داخلي في الخادم" });
    }
});

// المنفذ المحلي للتطوير
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`الخادم يعمل على المنفذ ${PORT}`));

module.exports = app;