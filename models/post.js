const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
});

// Creating Schema from Post
const postSchema = new mongoose.Schema({
    name: String,
    size: Number,
    key: String,
    url: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A post must have an user']
    }
})

postSchema.pre('save', function (next) {
    if (!this.url) {
        this.url = `${process.env.APP_URL}/files/${this.key}`
    }

    return next();
})

postSchema.pre('remove', async function (next) {

    if (process.env.STORAGE_OPTION === 's3') {
        return await s3.deleteObject({
            Bucket: process.env.BUCKET_NAME,
            Key: this.key
        }).promise()
    } else {
        return await promisify(fs.unlink)(path.resolve(__dirname, '..', 'temp', 'uploads', this.key))
    }
    // By default AWS use callback pattern to deal with assynchronous requests. Therefore, .promise() will wait the deleteObject() finish its demand

    return next();
})

postSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'fullName email'
    })

    return next();
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post