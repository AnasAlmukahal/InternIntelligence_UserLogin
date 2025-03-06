const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

// Toggle between login and register forms
registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Register User
document.querySelector('.sign-up form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('.sign-up input[type="email"]').value;
    const password = document.querySelector('.sign-up input[type="password"]').value;

    try {
        const res = await fetch('http://localhost:5000/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Allows cookies (JWT token)
        });

        const data = await res.json();
        if (res.ok) {
            alert('Registration successful! Please log in.');
            container.classList.remove("active"); // Switch to login form
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error('Error:', err);
    }
});

// Login User
document.querySelector('.sign-in form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('.sign-in input[type="email"]').value;
    const password = document.querySelector('.sign-in input[type="password"]').value;

    try {
        const res = await fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Allows cookies (JWT token)
        });

        const data = await res.json();
        if (res.ok) {
            alert('Login successful!');
            window.location.href = 'dashboard.html'; // Redirect to dashboard
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error('Error:', err);
    }
});

// Logout User (Add this function to your dashboard page)
async function logout() {
    try {
        const res = await fetch('http://localhost:5000/auth/logout', {
            method: 'POST',
            credentials: 'include'  // Include cookies (JWT token)
        });

        const data = await res.json();
        if (res.ok) {
            alert('Logged out successfully!');
            window.location.href = 'index.html'; // Redirect to login
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}
