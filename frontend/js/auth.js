
// API Configuration
const API_URL = 'https://taskmanager-java.onrender.com/api';

// UI Elements
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const showRegisterFlow = document.getElementById('showRegisterFlow');
const showLoginFlow = document.getElementById('showLoginFlow');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Toast Notification System
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('ion-icon');

    // Set style and icon
    toast.className = `toast ${type}`;
    icon.setAttribute('name', type === 'success' ? 'checkmark-circle-outline' : 'warning-outline');
    toastMessage.textContent = message;

    // Animate in
    toast.classList.add('show');

    // Auto hide
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Check Authentication State on load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        // If already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
});

// UI Flow Toggles
showRegisterFlow.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
});

showLoginFlow.addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
});

// Loading Button State Wrapper
function setButtonLoading(btn, isLoading, originalText) {
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> Processing...`;
        btn.style.opacity = '0.7';
    } else {
        btn.disabled = false;
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
    }
}

// Authentication Logic: Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('loginUsername').value.trim();
    const passwordInput = document.getElementById('loginPassword').value.trim();
    const btn = document.getElementById('loginBtn');

    if (!usernameInput || !passwordInput) {
        showToast('Please enter both username and password.', 'error');
        return;
    }

    const originalContent = btn.innerHTML;
    setButtonLoading(btn, true, originalContent);

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            showToast('Welcome back!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        } else {
            showToast(data.message || 'Login failed. Please check credentials.', 'error');
        }
    } catch (error) {
        showToast('Cannot connect to server. Is the backend running?', 'error');
        console.error('Login Error:', error);
    } finally {
        setButtonLoading(btn, false, originalContent);
    }
});

// Authentication Logic: Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('registerUsername').value.trim();
    const passwordInput = document.getElementById('registerPassword').value.trim();
    const btn = document.getElementById('registerBtn');

    if (usernameInput.length < 4) {
        showToast('Username must be at least 4 characters long.', 'error');
        return;
    }

    if (passwordInput.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
    }

    const originalContent = btn.innerHTML;
    setButtonLoading(btn, true, originalContent);

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            showToast('Account created successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        } else {
            // Spring Boot Validation errors map 'message' or 'errors'
            showToast(data.message || 'Registration failed.', 'error');
        }
    } catch (error) {
        showToast('Cannot connect to server. Is the backend running?', 'error');
        console.error('Registration Error:', error);
    } finally {
        setButtonLoading(btn, false, originalContent);
    }
});
