// Better Auth Client for Email Authentication with Verification
class BetterAuthClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Check if user is already authenticated
        try {
            const session = await this.getSession();
            if (session?.user) {
                this.currentUser = session.user;
                this.updateUI();
            }
        } catch (error) {
            console.log('No active session');
        }
    }

    // Get current session
    async getSession() {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/get-session`, {
                credentials: 'include'
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

    // Sign up with email verification
    async signUp(email, password, fullName) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/sign-up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    password,
                    name: fullName,
                    fullName: fullName
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Show verification dialog
                this.showEmailVerificationDialog(email, 'registration');
                return { success: true, message: 'Account created! Please check your email for verification code.' };
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    }

    // Sign in with email verification check
    async signIn(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/sign-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const result = await response.json();

            if (response.ok) {
                if (result.user && !result.user.emailVerified) {
                    // Email not verified, show verification dialog
                    this.showEmailVerificationDialog(email, 'login');
                    throw new Error('Please verify your email address to continue');
                }
                
                this.currentUser = result.user;
                this.updateUI();
                return { success: true, user: result.user };
            } else {
                throw new Error(result.message || 'Login failed');
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
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    code
                })
            });

            const result = await response.json();

            if (response.ok) {
                return { success: true, message: 'Email verified successfully!' };
            } else {
                throw new Error(result.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    }

    // Resend verification code
    async resendVerificationCode(email) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/send-verification-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.ok) {
                return { success: true, message: 'New verification code sent!' };
            } else {
                throw new Error(result.message || 'Failed to send verification code');
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            throw error;
        }
    }

    // Sign out
    async signOut() {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/sign-out`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                this.currentUser = null;
                this.updateUI();
                return { success: true };
            }
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    // Show email verification dialog
    showEmailVerificationDialog(email, type) {
        // Create dialog HTML
        const dialogHTML = `
            <div class="verification-dialog-overlay" id="verificationDialog">
                <div class="verification-dialog">
                    <div class="verification-dialog-header">
                        <h3>Email Verification</h3>
                        <button class="verification-close-btn" onclick="authClient.closeVerificationDialog()">×</button>
                    </div>
                    <div class="verification-dialog-content">
                        <div class="verification-icon">📧</div>
                        <p>We've sent a 4-digit verification code to:</p>
                        <strong>${email}</strong>
                        <div class="verification-code-input">
                            <input type="text" id="verificationCode" maxlength="4" placeholder="Enter 4-digit code" />
                        </div>
                        <div class="verification-buttons">
                            <button class="btn-verify" onclick="authClient.handleVerificationSubmit('${email}', '${type}')">
                                Verify Email
                            </button>
                            <button class="btn-resend" onclick="authClient.handleResendCode('${email}')">
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
            document.getElementById('verificationCode').focus();
        }, 100);

        // Handle Enter key
        document.getElementById('verificationCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleVerificationSubmit(email, type);
            }
        });
    }

    // Handle verification code submission
    async handleVerificationSubmit(email, type) {
        const code = document.getElementById('verificationCode').value.trim();
        const messageEl = document.getElementById('verificationMessage');

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
                    btn.textContent = this.currentUser.fullName || this.currentUser.name || 'My Account';
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
}

// Create global auth client instance
window.authClient = new BetterAuthClient();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BetterAuthClient;
} 