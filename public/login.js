const loginForm = document.getElementById("loginForm");

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Successfully logged in!');
            window.location.href = '/admin';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error logging in.');
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function() {
    
    if (loginForm) loginForm.addEventListener("submit", handleLogin);
});