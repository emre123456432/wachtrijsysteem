const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());
app.use(express.static('public'));

let queue = [];
let validTokens = new Set();
let currentToken = '';

function generateToken() {
    const newToken = crypto.randomBytes(8).toString('hex');
    validTokens.add(newToken);
    currentToken = newToken;
    setTimeout(() => { validTokens.delete(newToken); }, 150000); 
}

setInterval(generateToken, 120000); 
generateToken(); 

app.get('/api/qr-token', (req, res) => { res.json({ token: currentToken }); });

app.post('/api/join', (req, res) => {
    const { name, token } = req.body;
    if (!validTokens.has(token)) {
        return res.status(403).json({ error: 'QR-code is verlopen. Scan de code op het scherm opnieuw.' });
    }
    queue.push({ id: Date.now(), name });
    res.json({ success: true, position: queue.length });
});

app.get('/api/queue', (req, res) => { res.json(queue); });

app.delete('/api/queue/:id', (req, res) => {
    const idToRemove = parseInt(req.params.id);
    queue = queue.filter(patient => patient.id !== idToRemove);
    res.json({ success: true });
});

app.listen(3000, () => console.log('Server draait op poort 3000'));