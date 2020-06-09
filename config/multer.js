const multer = require('multer')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')
const path = require('path')
const crypto = require('crypto')


/**
 * CDN AWS S3
 * 
 * new aws.S3() already read .env file by default. But i configured manually for learning purpose
 * contentType: multerS3.AUTO_CONTENT_TYPE enable to send mimetypes of uploaded files to Amazon, providing the possibility to be openen in a browser
 * acl: enable permission to read all files that is sended to AmazonS3
 * crypto.randomBytes create a 16 random bytes(hash) to avoid conflict between two or more files with the same name
 * 
 */
const storageS3Option = multerS3({
    s3: new aws.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    }),
    bucket: process.env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (req, file, cb) => {
        crypto.randomBytes(16, (err, hash) => {
            if (err) cb(err);

            const fileName = `${hash.toString('hex')}-${file.originalname}`;
            cb(null, fileName); // multer-s3 already generate the property req.file.key to return the filename 
        })
    }
})

/**
 * Local Storage Configuration
 * 
 * storage: diskStorage({destination}) --> 'destination' will override the 'dest' property from multer({dest})
 * crypto.randomBytes(16,(err,hash)=>{...}) --> create a 16 random bytes(hash) to avoid conflict between two or more files with the name name
 * Since multer-s3 generates the property 'key' on req.file to specify the name of the file, let's create a custom property .key to
 * make easier the validation on Router Handler /form
 * 
 */
const localStorageOption = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, '..', 'temp', 'uploads'))
    },
    filename: (req, file, cb) => {
        crypto.randomBytes(16, (err, hash) => {
            if (err) cb(err);

            // const fileName = `${hash.toString('hex')}-${file.originalname}`;
            file.key = `${hash.toString('hex')}-${file.originalname}`;

            // cb(null, fileName);
            cb(null, file.key);
        })
    }
});

const storageTypes = {
    local: localStorageOption,
    s3: storageS3Option
}

module.exports = {
    dest: path.resolve(__dirname, '..', 'temp', 'uploads'), //samething as storage.destination but works like a default option. So we'll leave it here anyway
    storage: storageTypes[process.env.STORAGE_OPTION],
    limits: { // determine the limit capacity of a file or number of files to be retrieved from client side
        fileSize: 2 * 1024 * 1024, //2MB max capacity
    },
    fileFilter: (req, file, cb) => { // filter the type of files (jpg, png, pdf, doc, etc) that are coming from client side
        // cb is a old way of dealing with async calls in Multer Module/lib. We call him after verify if his mimetype is allowed
        const allowedMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif',
            'application/pdf'
        ]

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'))
        }
    }
}