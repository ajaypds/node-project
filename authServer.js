require("dotenv").config()
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()
const users = []

app.use(express.json())

app.post("/login", async (req, res) => {
    const user = users.find((c) => c.user === req.body.name)

    if (user === null || user === undefined) {
        console.log("user not found")
        res.status(404).send({ error: "User does not exist!" })
        return
    }
    console.log({ user })

    if (await bcrypt.compare(req.body.password, user.password)) {
        const accessToken = generateAccessToken({ user: req.body.name })
        const refreshToken = generateRefreshToken({ user: req.body.name })
        res.json({ accessToken: accessToken, refreshToken: refreshToken })
        return
    } else {
        res.status(401).send({ error: "Password Incorrect!" })
        return
    }

    res.status(200).send({ message: "ok" })
})

app.post("/refreshToken", (req, res) => {
    if (!refreshTokens.includes(req.body.token)) {
        res.status(400).send("Refresh Token Invalid")
        return
    }

    refreshTokens = refreshTokens.filter((c) => c != req.body.token)

    const accessToken = generateAccessToken({ user: req.body.name })
    const refreshToken = generateRefreshToken({ user: req.body.name })

    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

app.delete("/logout", (req, res) => {
    refreshTokens = refreshTokens.filter((c) => c != req.body.token)
    res.status(200).send({ message: "Logged out!" })
})

app.post("/createUser", async (req, res) => {
    const user = req.body.name
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    users.push({ user: user, password: hashedPassword })

    res.status(201).send(users)

    console.log(users)
})

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
}

let refreshTokens = []
const generateRefreshToken = (user) => {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "20m" })
    refreshTokens.push(refreshToken)
    return refreshToken
}

const port = process.env.TOKEN_SERVER_PORT

app.listen(port, () => {
    console.log(`Authorization server running on ${port}...`)
})