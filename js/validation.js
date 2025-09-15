// Enhanced Form Validation System
// Inspired by simple email authentication validation techniques

class FormValidator {
    constructor() {
        this.rules = {
            fullName: {
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-Z\s]{2,50}$/,
                errorMessages: {
                    empty: 'Full name is required',
                    minLength: 'Full name must be at least 2 characters',
                    maxLength: 'Full name must be less than 50 characters',
                    pattern: 'Full name can only contain letters and spaces'
                }
            },
            email: {
                minLength: 5,
                maxLength: 100,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                errorMessages: {
                    empty: 'Email address is required',
                    minLength: 'Email must be at least 5 characters',
                    maxLength: 'Email must be less than 100 characters',
                    pattern: 'Please enter a valid email address'
                }
            },
            password: {
                minLength: 6,
                maxLength: 60,
                patterns: {
                    weak: /^.{1,5}$/,
                    fair: /^(?=.*[a-z]).{6,}$/,
                    good: /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
                    strong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
                },
                errorMessages: {
                    empty: 'Password is required',
                    minLength: 'Password must be at least 6 characters',
                    maxLength: 'Password must be less than 60 characters'
                }
            }
        };

        this.init();
    }

    // Initialize validation when DOM is ready
    init() {
        // Wait for DOM to be ready, then setup validation
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupValidation());
        } else {
            this.setupValidation();
        }
    }

    // Setup all validation listeners
    setupValidation() {
        this.setupSignupValidation();
        this.setupStaffValidation();
        this.setupUserLoginValidation();
    }

    // Validate individual field based on rules
    validateField(fieldName, value) {
        const rule = this.rules[fieldName];
        if (!rule) return { isValid: true };

        // Check if empty
        if (!value || value.trim().length === 0) {
            return {
                isValid: false,
                message: rule.errorMessages.empty
            };
        }

        const trimmedValue = value.trim();

        // Check minimum length
        if (rule.minLength && trimmedValue.length < rule.minLength) {
            return {
                isValid: false,
                message: rule.errorMessages.minLength
            };
        }

        // Check maximum length  
        if (rule.maxLength && trimmedValue.length > rule.maxLength) {
            return {
                isValid: false,
                message: rule.errorMessages.maxLength
            };
        }

        // Check pattern
        if (rule.pattern && !rule.pattern.test(trimmedValue)) {
            return {
                isValid: false,
                message: rule.errorMessages.pattern
            };
        }

        return { isValid: true };
    }

    // Check password strength and return appropriate level
    checkPasswordStrength(password) {
        if (!password) return { strength: 'none', text: 'Enter a password' };

        const patterns = this.rules.password.patterns;
        
        if (patterns.strong.test(password)) {
            return { strength: 'strong', text: 'Strong password!' };
        } else if (patterns.good.test(password)) {
            return { strength: 'good', text: 'Good password' };
        } else if (patterns.fair.test(password)) {
            return { strength: 'fair', text: 'Fair password' };
        } else {
            return { strength: 'weak', text: 'Weak password' };
        }
    }

    // Show error state and message for a field
    showError(fieldName, message) {
        const input = document.getElementById(`signup-${fieldName}`) || document.getElementById(`${fieldName}`);
        if (!input) return;

        const formGroup = input.closest('.form-group');
        const errorElement = document.getElementById(`${fieldName}-error`);
        const successElement = document.getElementById(`${fieldName}-success`);

        if (formGroup) {
            formGroup.classList.remove('has-success', 'has-warning');
            formGroup.classList.add('has-error');
        }

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }

        if (successElement) {
            successElement.classList.remove('show');
        }
    }

    // Show success state and optional message for a field
    showSuccess(fieldName, message = '') {
        const input = document.getElementById(`signup-${fieldName}`) || document.getElementById(`${fieldName}`);
        if (!input) return;

        const formGroup = input.closest('.form-group');
        const errorElement = document.getElementById(`${fieldName}-error`);
        const successElement = document.getElementById(`${fieldName}-success`);

        if (formGroup) {
            formGroup.classList.remove('has-error', 'has-warning');
            formGroup.classList.add('has-success');
        }

        if (errorElement) {
            errorElement.classList.remove('show');
        }

        if (successElement && message) {
            successElement.textContent = message;
            successElement.classList.add('show');
        }
    }

    // Clear all validation states for a field
    clearValidation(fieldName) {
        const input = document.getElementById(`signup-${fieldName}`) || document.getElementById(`${fieldName}`);
        if (!input) return;

        const formGroup = input.closest('.form-group');
        const errorElement = document.getElementById(`${fieldName}-error`);
        const successElement = document.getElementById(`${fieldName}-success`);

        if (formGroup) {
            formGroup.classList.remove('has-error', 'has-success', 'has-warning');
        }

        if (errorElement) errorElement.classList.remove('show');
        if (successElement) successElement.classList.remove('show');
    }

    // Update password strength visual indicator
    updatePasswordStrength(password) {
        const strengthContainer = document.getElementById('password-strength');
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');

        if (!strengthContainer || !strengthFill || !strengthText) return;

        const { strength, text } = this.checkPasswordStrength(password);

        // Show/hide strength indicator based on password presence
        if (password && password.length > 0) {
            strengthContainer.classList.add('show');
        } else {
            strengthContainer.classList.remove('show');
            return;
        }

        // Remove all previous strength classes
        strengthFill.classList.remove('weak', 'fair', 'good', 'strong');
        strengthText.classList.remove('weak', 'fair', 'good', 'strong');

        // Add current strength class
        if (strength !== 'none') {
            strengthFill.classList.add(strength);
            strengthText.classList.add(strength);
        }

        strengthText.textContent = text;
    }

    // Validate password confirmation
    validateConfirmPassword(password, confirmPassword) {
        if (!confirmPassword) {
            return {
                isValid: false,
                message: 'Please confirm your password'
            };
        }

        if (password !== confirmPassword) {
            return {
                isValid: false,
                message: 'Passwords do not match'
            };
        }

        return { isValid: true };
    }

    // Setup real-time validation for signup form
    setupSignupValidation() {
        const fullNameInput = document.getElementById('signup-fullname');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const confirmPasswordInput = document.getElementById('signup-confirm-password');

        if (!fullNameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            return; // Elements not found on this page
        }

        // Full Name validation with real-time feedback
        fullNameInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            const validation = this.validateField('fullName', value);

            if (value.length === 0) {
                this.clearValidation('fullname');
            } else if (validation.isValid) {
                this.showSuccess('fullname', '✓ Valid name');
            } else {
                this.showError('fullname', validation.message);
            }
        });

        fullNameInput.addEventListener('blur', (e) => {
            const value = e.target.value.trim();
            const validation = this.validateField('fullName', value);

            if (!validation.isValid) {
                this.showError('fullname', validation.message);
            }
        });

        // Email validation with real-time feedback
        emailInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            const validation = this.validateField('email', value);

            if (value.length === 0) {
                this.clearValidation('email');
            } else if (validation.isValid) {
                this.showSuccess('email', '✓ Valid email');
            } else {
                this.showError('email', validation.message);
            }
        });

        emailInput.addEventListener('blur', (e) => {
            const value = e.target.value.trim();
            const validation = this.validateField('email', value);

            if (!validation.isValid) {
                this.showError('email', validation.message);
            }
        });

        // Password validation with strength indicator
        passwordInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const validation = this.validateField('password', value);

            // Update password strength indicator
            this.updatePasswordStrength(value);

            if (value.length === 0) {
                this.clearValidation('password');
            } else if (validation.isValid) {
                this.showSuccess('password');
            } else {
                this.showError('password', validation.message);
            }

            // Re-validate confirm password if it has a value
            if (confirmPasswordInput.value) {
                const confirmValidation = this.validateConfirmPassword(value, confirmPasswordInput.value);
                if (confirmValidation.isValid) {
                    this.showSuccess('confirm-password', '✓ Passwords match');
                } else {
                    this.showError('confirm-password', confirmValidation.message);
                }
            }
        });

        // Confirm Password validation
        confirmPasswordInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const passwordValue = passwordInput.value;
            const validation = this.validateConfirmPassword(passwordValue, value);

            if (value.length === 0) {
                this.clearValidation('confirm-password');
            } else if (validation.isValid) {
                this.showSuccess('confirm-password', '✓ Passwords match');
            } else {
                this.showError('confirm-password', validation.message);
            }
        });

        confirmPasswordInput.addEventListener('blur', (e) => {
            const value = e.target.value;
            const passwordValue = passwordInput.value;
            const validation = this.validateConfirmPassword(passwordValue, value);

            if (!validation.isValid) {
                this.showError('confirm-password', validation.message);
            }
        });
    }

    // Setup validation for staff login (basic validation)
    setupStaffValidation() {
        const staffIdInput = document.getElementById('staff-id');
        const staffPasswordInput = document.getElementById('staff-password');

        if (!staffIdInput || !staffPasswordInput) return;

        staffIdInput.addEventListener('blur', (e) => {
            const value = e.target.value.trim();
            if (value.length === 0) {
                // Could add visual feedback here if desired
            }
        });

        staffPasswordInput.addEventListener('blur', (e) => {
            const value = e.target.value;
            if (value.length === 0) {
                // Could add visual feedback here if desired  
            }
        });
    }

    // Setup validation for user login (basic validation)
    setupUserLoginValidation() {
        const userEmailInput = document.getElementById('user-email');
        const userPasswordInput = document.getElementById('user-password');

        if (!userEmailInput || !userPasswordInput) return;

        userEmailInput.addEventListener('blur', (e) => {
            const value = e.target.value.trim();
            if (value.length > 0) {
                const validation = this.validateField('email', value);
                // Could add visual feedback here if desired
            }
        });

        userPasswordInput.addEventListener('blur', (e) => {
            const value = e.target.value;
            if (value.length > 0) {
                const validation = this.validateField('password', value);
                // Could add visual feedback here if desired
            }
        });
    }

    // Validate entire signup form before submission
    validateSignupForm() {
        const fullName = document.getElementById('signup-fullname')?.value.trim() || '';
        const email = document.getElementById('signup-email')?.value.trim() || '';
        const password = document.getElementById('signup-password')?.value || '';
        const confirmPassword = document.getElementById('signup-confirm-password')?.value || '';

        let isValid = true;

        // Validate full name
        const fullNameValidation = this.validateField('fullName', fullName);
        if (!fullNameValidation.isValid) {
            this.showError('fullname', fullNameValidation.message);
            isValid = false;
        }

        // Validate email
        const emailValidation = this.validateField('email', email);
        if (!emailValidation.isValid) {
            this.showError('email', emailValidation.message);
            isValid = false;
        }

        // Validate password
        const passwordValidation = this.validateField('password', password);
        if (!passwordValidation.isValid) {
            this.showError('password', passwordValidation.message);
            isValid = false;
        }

        // Validate confirm password
        const confirmPasswordValidation = this.validateConfirmPassword(password, confirmPassword);
        if (!confirmPasswordValidation.isValid) {
            this.showError('confirm-password', confirmPasswordValidation.message);
            isValid = false;
        }

        return isValid;
    }

    // Clear all validation states (useful when modal closes)
    clearAllValidation() {
        ['fullname', 'email', 'password', 'confirm-password'].forEach(field => {
            this.clearValidation(field);
        });

        // Hide password strength indicator
        const strengthContainer = document.getElementById('password-strength');
        if (strengthContainer) {
            strengthContainer.classList.remove('show');
        }
    }

    // Add enhanced button loading state
    setButtonLoading(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
}

// Initialize the validation system
const formValidator = new FormValidator();

// Make it globally available for other scripts
window.FormValidator = formValidator;

// Export validation function for signup form
window.validateSignupForm = () => formValidator.validateSignupForm();
window.clearAllValidation = () => formValidator.clearAllValidation();
window.setButtonLoading = (buttonId, isLoading) => formValidator.setButtonLoading(buttonId, isLoading); 