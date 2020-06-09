const dotenv = require('dotenv')
dotenv.config({ path: `${__dirname}/.env` })

const path = require('path')
const express = require('express')
// Load the handlebars module
const exphbs = require('express-handlebars')
const morgan = require('morgan')
const app = express()
const router = require('./routes')
const mongoose = require('mongoose')

//Connect to database located in the docker container mongo_db_handlebars
// Database name -> upload
mongoose.connect(process.env.MONGO_DB_CONNECTION, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(data => {
    console.log(`Connection to database successfully established`)
}).catch(err => {
    console.log(`Was not possible to connect to the database. Reason: ${err}`)
})

// Using a different extension name for my handlebars template files
app.engine('.hbs', exphbs({
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    extname: '.hbs',
    defaultLayout: 'index'
}))

// app.engine('handlebars', exphbs({
//     layoutsDir: path.join(__dirname, 'views', 'layouts')
// }))

app.set('view engine', '.hbs')
// app.set('view engine', 'handlebars')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use('/files', express.static(`${__dirname}/temp/uploads`))
app.use('/files', express.static(path.resolve(__dirname, 'temp', 'uploads')))
app.use(express.static(`${__dirname}/public`))
app.use(morgan('dev'))
// Importing Routes
app.use(router)

// Error handling
app.use(async (err, req, res, next) => {


    return res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message
    })
})


const PORT = process.env.PORT ? process.env.PORT : 3000;

app.listen(3000, () => {
    console.log(`Server listenning on port 3000`)
})