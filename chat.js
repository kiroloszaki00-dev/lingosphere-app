const fetch = require('node-fetch');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ text: 'Method Not Allowed' });
    }

    const { prompt, systemInstruction } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ text: "خطأ: مفتاح الـ API غير مفقود في الإعدادات." });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemInstruction}\n\nUser: ${prompt}` }] }]
            })
        });
        
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أستطع فهم ذلك.";
        
        return res.status(200).json({ text: responseText });
    } catch (error) {
        return res.status(500).json({ text: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي." });
    }
}