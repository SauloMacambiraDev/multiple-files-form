const router = require('express').Router()
const multer = require('multer')
const multerConfig = require('./config/multer')
const axios = require('axios')

const upload = multer(multerConfig)

const userController = require('./controllers/userController')

const Post = require('./models/post')
const User = require('./models/user')

router.get('/testApi', (req, res, next) => {
    res.status(200).json({
        status: 'success',
        message: 'Testing Multiple File from front'
    })
})

// User API
router.route('/users')
    .get(userController.index)
    .post(userController.store);

router.route('/users/:id')
    .get(userController.show);

// Views

router.get('/', async (req, res, next) => {
    // Call to a specific API
    const responseDogs = await axios.get('https://dog.ceo/api/breeds/list/all')

    const dogs = (responseDogs.data.message) ? responseDogs.data.message.terrier : []

    const lolHeroes = [
        {
            name: 'Katarina',
            lane: 'midlaner'
        },
        {
            name: 'Jayce',
            lane: 'toplaner'
        },
        {
            name: 'Heimerdinger',
            lane: 'toplaner'
        },
        {
            name: 'Zed',
            lane: 'midlaner'
        },
        {
            name: 'Azir',
            lane: 'midlaner'
        }
    ];

    return res.render('main', { layout: 'index', dogs, lolHeroes })
    //since the defaultLayout: 'index' is enabled, there is no need to put the property { layout: index} as a second parameter
    // if defaultLayout wasn't configured, handlebars engine would search for main.hbs inside layouts folder and would throw an Error 
    return res.render('main')
})

router.get('/form', (req, res, next) => {

    return res.render('form')
})

// router.get('/test', (req, res, next) => {
//     return res.render('teste/t1', { layout: false })

// })

// Posts API
router.get('/posts', async (req, res, next) => {
    try {

        const posts = await Post.find()

        const totalOfPosts = await Post.find().count()
        res.header('X-Total-Count', totalOfPosts)

        return res.status(200).json({
            status: 'success',
            posts
        });
    } catch (error) {
        return next(error)
    }
})

router.post('/posts', upload.single('singleFile'), async (req, res, next) => {
    try {
        console.log(req.file)
        console.log(req.body.email)

        if (!req.file || !req.body.email) {
            let err = new Error('Please, provide a file and an e-mail')
            err.statusCode = 400
            return next(err)
        }

        const { email } = req.body
        const { originalname: name, key, size, location: url = "" } = req.file
        // const { originalname: name, filename: key, size } = req.file

        const user = await User.findOne({ email })
        if (!user) {
            let err = new Error(`User with email ${email} doesn't exist`)
            err.statusCode = 400
            return next(err)
        }

        const newPost = await Post.create({
            email,
            name,
            size,
            key,
            url: url,
            user: user._id
        })

        return res.json({
            status: 'success',
            message: `We've stored successfully the file!`,
            file: newPost
        })
    } catch (err) {
        return next(err)
    }
})

router.delete('/posts/:id', async (req, res, next) => {
    try {
        const { id } = req.params

        const post = await Post.findById(id)

        if (!post) {
            let error = new Error(`Post doesn't exist`)
            error.statusCode = 400;
            return next(error)
        }

        await post.remove()

        return res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// 404 not found route
router.use((req, res, next) => {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    return res.render('not-found', { layout: false, urlNotFound: fullUrl })
});



module.exports = router