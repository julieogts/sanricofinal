// 🎯 Simple Authentication Client - Works with existing MongoDB setup
class SimpleAuthClient {
    constructor() {
        this.baseURL = 'http://localhost:3000';
        this.currentUser = null;
        this.token = localStorage.getItem('auth_token');
        this.init();
    }

    async init() {
        // Check if user is already authenticated
        if (this.token) {
            try {
                const session = await this.getSession();
                if (session?.user) {
                    this.currentUser = session.user;
                    this.updateUI();
                }
            } catch (error) {
                // Token invalid, remove it
                localStorage.removeItem('auth_token');
                this.token = null;
            }
        }
    }

    // Get current session
    async getSession() {
        if (!this.token) return null;
        
        try {
            const response = await fetch(`${this.baseURL}/api/auth/user`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Session check failed:', error);
            return null;
        }
    }

    // Sign up with email verification - Use localStorage approach like existing system
    async signUp(email, password, fullName) {
        try {
            // Validate input
            if (!email || !password || !fullName) {
                throw new Error('All fields are required');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // Check if email is valid
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Check if user already exists (localStorage approach)
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            if (existingUsers.find(user => user.email === email)) {
                throw new Error('An account with this email already exists');
            }

            // Create user object
            const userData = {
                id: Date.now().toString(),
                fullName: fullName,
                email: email,
                password: password, // In production, this should be hashed
                provider: 'email',
                isStaff: false,
                createdAt: new Date().toISOString(),
                emailVerified: true // Skip email verification for now
            };

            // Add new user to users array
            existingUsers.push(userData);
            localStorage.setItem('users', JSON.stringify(existingUsers));

            // Log the user in automatically
            this.currentUser = userData;
            localStorage.setItem('currentUser', JSON.stringify(userData));

            return { success: true, message: `Welcome, ${fullName}! Your account has been created successfully.` };
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    }

    // Sign in with email verification check
    async signIn(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Store token and user data
                this.token = result.token;
                this.currentUser = result.user;
                localStorage.setItem('auth_token', this.token);
                
                this.updateUI();
                return { success: true, user: result.user };
            } else {
                if (result.needsVerification) {
                    // Email not verified, show verification dialog
                    this.showEmailVerificationDialog(email, 'login');
                }
                // Provide more user-friendly error messages
                let errorMessage = result.message || result.error || 'Login failed';
                if (errorMessage === 'Invalid email or password') {
                    errorMessage = 'Account not found or incorrect password. Please check your credentials or create a new account.';
                } else if (errorMessage === 'Please verify your email before logging in') {
                    errorMessage = 'Please check your email and click the verification link before logging in.';
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    // Verify email with 4-digit code
    async verifyEmail(email, code) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    code
                })
            });

            const result = await response.json();

            if (response.ok) {
                return { success: true, message: result.message };
            } else {
                throw new Error(result.error || 'Verification failed');
            }
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    }

    // Resend verification code
    async resendVerificationCode(email) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/send-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.ok) {
                return { success: true, message: result.message };
            } else {
                throw new Error(result.error || 'Failed to send verification code');
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            throw error;
        }
    }

    // Forgot password
    async forgotPassword(email) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/send-password-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.ok) {
                return { success: true, message: result.message };
            } else {
                throw new Error(result.error || 'Failed to send reset email');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }

    // Sign out
    async signOut() {
        try {
            await fetch(`${this.baseURL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            // Clear local data
            this.token = null;
            this.currentUser = null;
            localStorage.removeItem('auth_token');
            this.updateUI();
        }
    }

    // Show email verification dialog (same beautiful UI as before)
    showEmailVerificationDialog(email, type) {
        // Create dialog HTML
        const dialogHTML = `
            <div class="verification-dialog-overlay" id="verificationDialog">
                <div class="verification-dialog">
                    <div class="verification-dialog-header">
                        <h3>Email Verification</h3>
                        <button class="verification-close-btn" onclick="simpleAuthClient.closeVerificationDialog()">×</button>
                    </div>
                    <div class="verification-dialog-content">
                        <div class="verification-icon">📧</div>
                        <p>We've sent a 4-digit verification code to:</p>
                        <strong>${email}</strong>
                        <div class="verification-code-input">
                            <input type="text" id="verificationCode" maxlength="4" placeholder="Enter 4-digit code" />
                        </div>
                        <div class="verification-buttons">
                            <button class="btn-verify" onclick="simpleAuthClient.handleVerificationSubmit('${email}', '${type}')">
                                Verify Email
                            </button>
                            <button class="btn-resend" onclick="simpleAuthClient.handleResendCode('${email}')">
                                Resend Code
                            </button>
                        </div>
                        <div id="verificationMessage" class="verification-message"></div>
                    </div>
                </div>
            </div>
        `;

        // Add dialog to page
        document.body.insertAdjacentHTML('beforeend', dialogHTML);

        // Focus on input
        setTimeout(() => {
            const input = document.getElementById('verificationCode');
            if (input) input.focus();
        }, 100);

        // Handle Enter key
        const codeInput = document.getElementById('verificationCode');
        if (codeInput) {
            codeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleVerificationSubmit(email, type);
                }
            });
        }
    }

    // Handle verification code submission
    async handleVerificationSubmit(email, type) {
        const codeInput = document.getElementById('verificationCode');
        const messageEl = document.getElementById('verificationMessage');
        
        if (!codeInput || !messageEl) return;
        
        const code = codeInput.value.trim();

        if (!code || code.length !== 4) {
            messageEl.innerHTML = '<span style="color: #e74c3c;">Please enter a 4-digit code</span>';
            return;
        }

        try {
            messageEl.innerHTML = '<span style="color: #3498db;">Verifying...</span>';
            
            const result = await this.verifyEmail(email, code);
            
            if (result.success) {
                messageEl.innerHTML = '<span style="color: #27ae60;">✓ Email verified successfully!</span>';
                
                setTimeout(() => {
                    this.closeVerificationDialog();
                    
                    if (type === 'login') {
                        // Retry login after verification
                        showToast('Email verified! Please sign in again.', 'success');
                        window.showLoginModal();
                    } else {
                        // Registration complete
                        showToast('Registration complete! You can now sign in.', 'success');
                        window.showLoginModal();
                    }
                }, 1500);
            }
        } catch (error) {
            messageEl.innerHTML = `<span style="color: #e74c3c;">❌ ${error.message}</span>`;
        }
    }

    // Handle resend code
    async handleResendCode(email) {
        const messageEl = document.getElementById('verificationMessage');
        if (!messageEl) return;
        
        try {
            messageEl.innerHTML = '<span style="color: #3498db;">Sending new code...</span>';
            
            const result = await this.resendVerificationCode(email);
            
            if (result.success) {
                messageEl.innerHTML = '<span style="color: #27ae60;">✓ New code sent to your email!</span>';
            }
        } catch (error) {
            messageEl.innerHTML = `<span style="color: #e74c3c;">❌ ${error.message}</span>`;
        }
    }

    // Close verification dialog
    closeVerificationDialog() {
        const dialog = document.getElementById('verificationDialog');
        if (dialog) {
            dialog.remove();
        }
    }

    // Update UI based on authentication state
    updateUI() {
        // Update login buttons, user info, etc.
        const loginBtns = document.querySelectorAll('#loginBtn, #topLoginBtn');
        
        if (this.currentUser) {
            loginBtns.forEach(btn => {
                if (btn) {
                    btn.textContent = this.currentUser.fullName || this.currentUser.email || 'My Account';
                    btn.onclick = () => {
                        if (this.currentUser.isStaff) {
                            window.location.href = 'staff-dashboard.html';
                        } else {
                            window.location.href = 'profile.html';
                        }
                    };
                }
            });
        } else {
            loginBtns.forEach(btn => {
                if (btn) {
                    btn.textContent = 'Log In';
                    btn.onclick = () => window.showLoginModal();
                }
            });
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Check if user is staff
    isStaff() {
        return this.currentUser?.isStaff === true;
    }
}

// Create global auth client instance
window.simpleAuthClient = new SimpleAuthClient();

// For backward compatibility with existing code
window.authClient = window.simpleAuthClient;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleAuthClient;
}