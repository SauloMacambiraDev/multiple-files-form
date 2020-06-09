const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'User must have full name registered'],
        trim: true
    },
    email: {
        type: String,
        required: true,
        validate: [validator.isEmail, 'A user must have an e-mail']
    },
    password: {
        type: String,
        required: [true, 'User must have password'],
        minLength: [6, 'User password must have 6 or more characters']
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please, confirm your password'],
        minlength: [6, 'Confirm password must have 6 or more characters and be equal to password'],
        validate: {
            validator: function (value) {
                return (value === this.password)
            },
            message: `Your confirm password has to be equal to your password`
        }
    }
});

userSchema.pre('save', async function (next) {

    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)
    this.confirmPassword = undefined

    return next()
});

const User = mongoose.model('User', userSchema);

module.exports = User;