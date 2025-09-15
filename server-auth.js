const express = require('express');
const path = require('path');
const { auth } = require('./lib/auth');
const config = require('./auth-config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Better Auth API routes
app.all('/api/auth/*', async (req, res) => {
    try {
        console.log(`${req.method} ${req.url}`);
        
        // Create a standard Request object for Better Auth
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const request = new Request(url.toString(), {
            method: req.method,
            headers: {
                ...req.headers,
                'content-type': req.headers['content-type'] || 'application/json'
            },
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
        });

        // Handle the request with Better Auth
        const response = await auth.handler(request);
        
        // Convert Response to Express response
        const responseBody = await response.text();
        
        // Set headers
        response.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });
        
        res.status(response.status).send(responseBody);
        
    } catch (error) {
        console.error('Auth API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Custom verification endpoint
app.post('/api/auth/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }
        
        // Use custom verification function
        const result = await auth.verifyEmailCode(email, code);
        
        res.json({ success: true, message: 'Email verified successfully' });
        
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(400).json({ error: error.message || 'Verification failed' });
    }
});

// Send verification email endpoint
app.post('/api/auth/send-verification-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        // Generate new verification code
        const verificationCode = Math.floor(1000 + Math.random() * 9000);
        
        // Send email via n8n webhook
        const response = await fetch(config.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: email,
                from: config.SENDER_EMAIL,
                subject: 'Verify Your Email - Sanrico Mercantile',
                verificationCode: verificationCode,
                userName: email,
                type: 'verification'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send verification email');
        }

        // Store verification code
        global.verificationCodes = global.verificationCodes || {};
        global.verificationCodes[email] = verificationCode;
        
        res.json({ success: true, message: 'Verification email sent' });
        
    } catch (error) {
        console.error('Send verification email error:', error);
        res.status(500).json({ error: error.message || 'Failed to send email' });
    }
});

// Password reset endpoint
app.post('/api/auth/send-password-reset', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        // Generate reset token
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // Send password reset email via n8n webhook
        const response = await fetch(config.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: email,
                from: config.SENDER_EMAIL,
                subject: 'Password Reset - Sanrico Mercantile',
                resetToken: resetToken,
                resetLink: `${config.BETTER_AUTH_URL}/reset-password?token=${resetToken}`,
                userName: email,
                type: 'password-reset'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send password reset email');
        }
        
        res.json({ success: true, message: 'Password reset email sent' });
        
    } catch (error) {
        console.error('Send password reset email error:', error);
        res.status(500).json({ error: error.message || 'Failed to send email' });
    }
});

// Serve static files and handle client-side routing
app.get('*', (req, res) => {
    // For client-side routing, serve the appropriate HTML file
    const requestedFile = req.path;
    
    if (requestedFile.endsWith('.html') || requestedFile === '/') {
        const filePath = requestedFile === '/' ? 'index.html' : requestedFile.substring(1);
        res.sendFile(path.join(__dirname, filePath));
    } else {
        res.status(404).send('File not found');
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📧 Using email: ${config.SENDER_EMAIL}`);
    console.log(`🔗 n8n webhook: ${config.N8N_WEBHOOK_URL}`);
    console.log(`🗄️ Database: ${config.DATABASE_URL}`);
});

module.exports = app; 