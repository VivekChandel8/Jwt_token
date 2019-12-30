const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

app.use(express.json())

let refreshTokens = []

const users = []

const posts = [
    {
        username: "Vivek",
        title: "Post 1"
    },
    {
        username: "Jim",
        title: "Post 2"
    }
]

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403)
      const accessToken = generateAccessToken({ name: user.name })
      res.json({ accessToken: accessToken })
    })
  })

  app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
  })
  

const authenicateToken = (req, res,next)=>{
    const authHeader = req.headers['authorization']
   
    const token = authHeader  && authHeader.split(' ')[1]
    console.log(token)
    if(token == null){
        return res.sendStatus(401)
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
            if(err){
                return res.sendStatus(403)
                }
        req.user = user
        next()
    })
}

app.get('/users', (req, res) => {
    res.json(users)
})

app.post('/users', async (req, res) => {
    try{
        //creating hashed password
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = {name: req.body.name, password:hashedPassword}
        users.push(user)
        res.send("User created, Sucessfully")
        res.status(201).send()
    }catch{
        res.status(500).send()
    }
})

app.post('/user/login', async (req, res) => {
    const user = users.find( user => user.name = req.body.name)
    if (user == null){
        return res.status(400).send('Cannot find user')
    }
    try{
        // decrycting user password
       if(await bcrypt.compare(req.body.password, user.password))
       {
        const username = req.body.name
        const user = {name: username}
       
        const acessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
        refreshTokens.push(refreshToken)
        res.json([{Message:"login sucessfull", acessToken: acessToken, refreshToken: refreshToken}])
       } else{
           res.send("Invaild Login Attempt")
            }
    }catch{
        res.status(500).send()
    }
})

app.get('/posts', authenicateToken, (req, res) => {
    
    res.json(posts.filter(post => post.username === req.user.name))
})




app.listen(3000)
console.log("Server running on port 3000")