/** 
 * @author gamer si code
 * @async 
 * @copyright gamer si
 * 
 * Copyright © gamer si aka Simon, 2021
 * Ich würd mich freuen, wenn du mich auf deiner Website verlinkst, solltest du meinenm Code verwenden!
 * Discord: gamer si#0001
 * youtube: gamer si code(https://www.youtube.com/channel/UCMBKkopvM10Z0sjzLwRWssg)
*/

// Frontend = das was der User sieht(kurz FE), Backend(BE) = das was am Server läuft

// imports
require('dotenv').config() // dotenv hilft uns, ENV Variablen auszulesen
const express = require('express') // express ist für die get und post requests
const app = express()
const mongoose = require('mongoose') // MongoDB Bridge
const User = require('./model/user') // das User model in ./model
const bcrypt = require('bcryptjs') // Passwortverschlüsselung
const jwt = require('jsonwebtoken') // json web tokens = die tokens die im Browser vom User gespeichert werden

const JWT_SECRET = process.env.JWT_SECRET // Liest das JWT Secret aus der .env datei aus.

mongoose.connect('mongodb://localhost:27017/accountdbtutorial', { // verbinden zur MongoDB Datenbank
    useNewUrlParser: true, //pararmeter
    useUnifiedTopology: true
})

app.set('view engine', 'ejs') // ejs verwenden 
app.use(express.json()) // json parser verwenden
app.use(express.static('public')) // der public ordner, den jeder sehen kann, für sachen die im Front End vberwendet werden

app.get('/', (req, res) => {// wenn man  localhost eingibt
    res.render('home.ejs') // ./views/home.ejs rendern
})

app.get('/register', (req, res) => { // wenn man localhost/register eingibt
    res.render('register.ejs')// ./views/register.ejs rendern
})

app.get('/login', (req, res) => { // wenn man  localhost/login eingibt
    res.render('login.ejs')// ./views/login.ejs rendern
})

app.post('/api/change-password', async (req, res) => { // endpunkt, um password zu ändern. Erreichbar über POST request(async fetch())
    const { token, newPassword: plainTextPassword } = req.body // man holt den token aus der request 
  
    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
      return res.json({ status: 'error', error: 'Bitte gib ein neues Passwort ein!' })
    }
  
    if (plainTextPassword.length < 5) {
      return res.json({ status: 'error', error: 'Das Passwort ist zu kurz(mindestens 5 Zeichen!)' })
    }
  
    try { // probiert den code auszuführen. sollte ein fehler entstehen kommt keine fehlermeldung sondern CATCH wird ausgeführt
      const user = jwt.verify(token, JWT_SECRET) // "bricht" den token in seine bestandsteile auf
  
      const _id = user.id // man holt sich die id aus dem token
  
      const dbuser = await User.findOne({ _id }).lean() //man sucht in der datenbank nach dem User mit der ID

      if(await bcrypt.compare(plainTextPassword, dbuser.password)){ // das neue passwort und das alte Passwort stimmen überein 
        return res.json({ status: 'error', message: 'Du hast bereits dieses Passwort!' })
      }
      const password = await bcrypt.hash(plainTextPassword, 10) // man verschlüsselt das neue Passwort
  
      await User.updateOne( // man ändert das Passwort
        { _id },
        {
          $set: { password }
        }
      )
      res.json({ status: 'ok', message: 'Passwort geändert!' })
    } catch (error) {
      console.log(error)
      res.json({ status: 'error', message: 'Überprüfen des tokens nicht möglich!' })
    }
})



app.post('/api/userinfo', async (req, res) => {// endpunkt, um infos über den Nutzer zu bekommen. Erreichbar über POST request(async fetch())
    const { token } = req.body
  
    try {// probiert den code auszuführen. sollte ein fehler entstehen kommt keine fehlermeldung sondern CATCH wird ausgeführt
      const user = jwt.verify(token, JWT_SECRET) // "bricht" den token in seine bestandsteile auf
  
      const _id = user.id // man holt sich die id aus dem token
    
      const dbuser = await User.findOne({ _id }).lean(); //man sucht in der datenbank nach dem User mit der ID
      
      res.json({ status: 'ok', username: dbuser.username , email: dbuser.email, id: _id }) // man gibt die daten an das FE zurück
    } catch (error) {
      console.log(error)
      res.json({ status: 'error', message: 'Überprüfen des tokens nicht möglich!' })
    }
  })

app.post('/api/login', async (req, res) => {// endpunkt, um login durchzuführen. Erreichbar über POST request(async fetch())
    const {email, password} = req.body;
    const user = await User.findOne({ email }).lean();
    
    if(!user){
        return res.json({ status: 'error', message: 'Falsche Email/Falsches Passwort!' })
    }

    if(await bcrypt.compare(password, user.password)){ // abfragen, ob der Nutzer das Passwort eingegeben hat, wie das verschlüsselte
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email
        }, JWT_SECRET)

        return res.json({ status: 'ok', data: token })
    }

    res.json({ status: 'error', message: 'Falsche Email/Falsches Passwort!' })
})


app.post('/api/register', async (req, res) => { // endpunkt, um sich zu registrieren. Erreichbar über POST request(async fetch())
    const {email, username, password: unencryptedPassword} = req.body;
    
    if(!username || typeof username !== 'string'){
        return res.json({ status: 'error', message: 'Bitte geben Sie einen Nutzernamen ein!' })
    }

    if(!unencryptedPassword || typeof unencryptedPassword !== 'string'){
        return res.json({ status: 'error', message: 'Bitte geben Sie ein Passwort ein!' })
    }
  
    if(unencryptedPassword.length < 5){
        return res.json({ status: 'error', message: 'Das Passwort ist zu kurz(mindestens 5 Zeichen!)' })
    }

    const password = await bcrypt.hash(unencryptedPassword, 10) // passwort verschlüssen

    try{// probiert den code auszuführen. sollte ein fehler entstehen kommt keine fehlermeldung sondern CATCH wird ausgeführt
        const response = await User.create({ // man erstellt einen user mit den eigegeben Daten
            email,
            username,
            password
        })
    } catch (error){
      if(error.code === 11000) {
          return res.json({ status: 'error', message: 'Die Email wird bereits verwendet!' })
      }
      throw error;
    }
    res.json({ status: 'ok' })
})

app.listen(80, () => { // server starten
    console.log('Website läuft auf port 80(http://localhost)') // Nachricht ausgeben
})