const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser');
const cors = require('cors');

const questionRouter = require('./routes/questionRouter');
const answerRouter = require('./routes/answerRouter')
const commentRouter = require('./routes/commentRouter')
const registerUserRouter = require('./routes/registerUserRouter')
const shortcutRouter = require('./routes/shortcutRouter')

const { connectMongoDB } = require('./connection')

const app = express()
const port = process.env.PORT || 4000

// Connection
connectMongoDB('communityDB')
    .then( () => console.log("DB Connected"))
    .catch ( (err) => console.log(err))

// Middleware - Plugin
app.use(express.urlencoded({extended:true}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


// Routes
app.use('/question', questionRouter)
app.use('/answer', answerRouter)
app.use('/comment', commentRouter)
app.use('/registerUser', registerUserRouter)
app.use('/shortcut', shortcutRouter)

app.listen(port, () => console.log(`community-microservice is listening on port ${port}!`))

