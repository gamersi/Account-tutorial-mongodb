const loginform = document.getElementsByClassName('login-form')[0]

loginform.addEventListener('submit', async (event) => {
    event.preventDefault()
    const email = document.getElementsByClassName('email-input')[0].value
    const password = document.getElementsByClassName('password-input')[0].value

    const result = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    }).then((res) => res.json())

    if(result.status == 'ok' ){
        localStorage.setItem('token', result.data)
        window.location = window.origin
    }else{
        alert("Fehler:" + result.message)
    }

})