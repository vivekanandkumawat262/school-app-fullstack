if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection 
db.on('error', error => console.error(error))
db.once('open', () => console.log("Connected to Mongoose"))

const jwt = require('jsonwebtoken')
app.use(express.json())

const posts = [
    {
        username: 'vivek',
        title: 'post1',
    },
    {
        username: 'john',
        title: 'post2',
    }
]

app.use('/', indexRouter)
app.get('/posts', authenticateToken ,(req, res) => {
    res.json(posts.filter(post => post.username === req.user.name))
})

app.post('/login', (req, res) => {
    //authenticate User 

    const username = req.body.username 
    const user = { name: username }

    const accessToken =  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken })
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user 
        next()
    })
}

app.listen(4000)