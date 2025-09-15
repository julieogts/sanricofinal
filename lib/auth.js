const { betterAuth } = require("better-auth");
const Database = require("better-sqlite3");
const config = require("../auth-config");

// Create Better Auth instance
const auth = betterAuth({
    database: new Database(config.DATABASE_URL),
    secret: config.BETTER_AUTH_SECRET,
    baseURL: config.BETTER_AUTH_URL,
    
    // Enable email and password authentication
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendEmailVerificationOnSignUp: true,
    },
    
    // Configure email verification
    emailVerification: {
        enabled: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async (data) => {
            // Generate 4-digit verification code
            const verificationCode = Math.floor(1000 + Math.random() * 9000);
            
            // Send email via n8n webhook
            try {
                const response = await fetch(config.N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: data.user.email,
                        from: config.SENDER_EMAIL,
                        subject: 'Verify Your Email - Sanrico Mercantile',
                        verificationCode: verificationCode,
                        userName: data.user.name || data.user.email,
                        type: 'verification'
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to send verification email');
                }

                // Store verification code temporarily (in real app, use Redis or database)
                global.verificationCodes = global.verificationCodes || {};
                global.verificationCodes[data.user.email] = verificationCode;
                
                console.log(`Verification email sent to ${data.user.email} with code: ${verificationCode}`);
                return { success: true };
            } catch (error) {
                console.error('Error sending verification email:', error);
                throw error;
            }
        }
    },
    
    // Configure user session
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 7 // 7 days
        }
    },
    
    // Database table configurations
    user: {
        additionalFields: {
            fullName: {
                type: "string",
                required: false
            },
            isStaff: {
                type: "boolean",
                required: false,
                defaultValue: false
            },
            createdAt: {
                type: "date",
                required: false,
                defaultValue: () => new Date()
            }
        }
    }
});

// Custom verification code validation
auth.verifyEmailCode = async (email, code) => {
    const storedCode = global.verificationCodes?.[email];
    if (!storedCode || storedCode.toString() !== code.toString()) {
        throw new Error('Invalid verification code');
    }
    
    // Remove used code
    delete global.verificationCodes[email];
    
    // Mark email as verified in database
    const user = await auth.api.getUserByEmail({ email });
    if (user) {
        await auth.api.updateUser({
            userId: user.id,
            emailVerified: true
        });
    }
    
    return { success: true };
};

module.exports = { auth }; 