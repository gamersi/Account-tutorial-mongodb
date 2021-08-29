if(localStorage.getItem('token') == null){
    window.location = window.origin + '/login'
}else{
    init()    
}

async function init(){
    const result = await fetch('/api/userinfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: localStorage.getItem('token')
        })
    }).then((res) => res.json())
    
    if (result.status === 'ok') {
        document.getElementsByClassName('name')[0].textContent = result.username
    } else {
        alert("Fehler:" + result.message)
    }
}

function LogOut() {
    localStorage.removeItem('token')
    location.reload()
}
