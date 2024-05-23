function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('registrationResponse').innerText = JSON.stringify(data);
        })
        .catch(error => console.error('Error:', error));
}