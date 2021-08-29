const registerform = document.getElementsByClassName('register-form')[0]

registerform.addEventListener('submit', async (event) => {
    event.preventDefault()
    const email = document.getElementsByClassName('email-input')[0].value
    const username = document.getElementsByClassName('username-input')[0].value
    const password = document.getElementsByClassName('password-input')[0].value
    const password2 = document.getElementsByClassName('password-input2')[0].value
    if(password == password2){
        const result = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                username,
                password
            })
        }).then((res) => res.json())

        if(result.status === 'error'){
            alert('Fehler: ' + result.message)
        }else{
            alert('Registrierung erfolgreich!')
        }
    }else{
        alert('Passwörter stimmen nicht überein!')
    }
})