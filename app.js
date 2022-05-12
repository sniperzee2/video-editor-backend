const express = require('express')
const morgan = require('morgan')
const path = require('path')
const cors = require('cors')
const {connectDB} = require('./config/db')
require('dotenv').config()

const app = express()

connectDB()
app.use(morgan('dev'))

app.use(express.urlencoded({extended: false}))
app.use(cors())
app.use(express.json())

console.log(path.join(__dirname + '/Documents'))
// ROUTES
app.use('/Documents', express.static(path.join(__dirname + '/Documents')));

app.use('/', require('./routes/authRouter'));
app.use('/', require('./routes/documentRouter'));

const port = process.env.PORT || 8000
app.listen(port,() => {
  console.log(`Server running on PORT ${port}`)
})