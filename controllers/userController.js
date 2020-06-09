const User = require('./../models/user')

exports.index = async (req, res, next) => {
    try {
        const users = await User.find();

        return res
            .status(200)
            .json({
                status: 'success',
                users
            })
    } catch (err) {
        next(err)
    }
}

exports.store = async (req, res, next) => {

    try {
        const { fullName, email, password, confirmPassword } = req.body;

        const newUser = await User.create({
            fullName,
            email,
            password,
            confirmPassword
        })

        return res.status(200).json({
            status: 'success',
            user: newUser
        })
    } catch (error) {
        next(error)
    }
}

exports.show = async (req, res, next) => {
    try {
        const { id } = req.params

        const user = await User.findById(id)
        // const user = await User.find({_id: id})
        // if (!user) {
        //     let error = new Error(`User doesn'nt exist`);
        //     error.statusCode = 400;
        //     return next(error)
        // }

        return res.status(200).json({
            status: 'success',
            user
        })
    } catch (error) {
        if (error.path == '_id' && error.name == 'CastError') {
            let userNotFoundError = new Error(`User doesn't exist`);
            userNotFoundError.statusCode = 401;
            return next(userNotFoundError)
        }

        return next(error)
    }
}