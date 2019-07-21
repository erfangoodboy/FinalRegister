const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const UserService = require('../Services/userServices');
const shortid = require('shortid')
const utils = require('../utils/functoin');

////// config multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        let fileInfo = path.parse(file.originalname)
        let fileName = shortid.generate() + fileInfo.name + fileInfo.ext;
        cb(null, fileName)
    }
});

let imageFilter = function (req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG)$/i)) {
        return callback(new Error('Only image files are allowed!'), false)
    }
    callback(null, true)
}

let uploadConfig = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {fileSize: 200 * 1024 * 1024}
})

let upload = uploadConfig.fields([{name: 'image', maxCount: 1}])

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.set({
        'Access-Control-Allow-Origin': '*'
    });
    return res.redirect('/index.html');
});

router.post('/register', upload, (req, res) => {
    let photo = req.files && req.files['image'] ? req.files['image'][0].filename : null

    UserService.register(
        req.body.email,
        req.body.name,
        req.body.password,
        req.body.phone,
        photo
    ).then((user) => {

        res.status(200).send({
            status: 200
        });

    }).catch((err) => {
        if (err.eText) {
            if (typeof err.eText !== 'string') {
                err.eText = err.eText.toString()
            }
        } else {
            err.eCode = 500
            err.eText = err
        }
        res.status(err.eCode).send({
            success: false,
            error: err.eText.toString()
        })
    })

});

router.post('/login' , (req ,res)=>{
    UserService.login1(req.body.email , req.body.password)
        .then((token) =>{
            res.setHeader('x-auth' , token) ;
            res.status(200).send({success: true}) ;
        })
        .catch((err)=>{
            if (err.eText) {
                if (typeof err.eText !== 'string') {
                    err.eText = err.eText.toString()
                }
            } else {
                err.eCode = 500
                err.eText = err
            }
            res.status(err.eCode).send({
                success: false,
                error: err.eText.toString()
            })
        })
});

router.post('/edit', utils.auth, upload, (req, res) => {
    var filename = req.files['image'][0].filename;
    console.log(filename);

    UserService.edit(req.user, req.body.name, req.body.password, filename)
        .then((doc) => {
            res.status(200).send({status: 200})
        })
        .catch((err) => {
            if (err.eText) {
                if (typeof err.eText !== 'string') {
                    err.eText = err.eText.toString()
                }
            } else {
                err.eCode = 500
                err.eText = err
            }
            res.status(err.eCode).send({
                success: false,
                error: err.eText.toString()
            })
        })
});

router.post('/ticket/new', utils.auth , (req, res)=>{
    UserService.startTicket(req.user , req.body.text , req.body.title , req.body.deptId)
        .then(()=>{
            res.status(200).send({success: true}) ;
        })
        .catch((err)=>{
            if (err.eText) {
                if (typeof err.eText !== 'string') {
                    err.eText = err.eText.toString()
                }
            } else {
                err.eCode = 500
                err.eText = err
            }
            res.status(err.eCode).send({
                success: false,
                error: err.eText.toString()
            })
        })
});

router.post('/comment/sent' , utils.auth , (req , res ) => {
    UserService.sendComment(req.user , req.body.text , req.body.ticket_id)
        .then(()=>{
            res.status(200).send({success: true}) ;
        })
        .catch((err) => {
            if (err.eText) {
                if (typeof err.eText !== 'string') {
                    err.eText = err.eText.toString()
                }
            } else {
                err.eCode = 500
                err.eText = err
            }
            res.status(err.eCode).send({
                success: false,
                error: err.eText.toString()
            })
        })
});

router.get('/showTicket' , utils.auth , ( req , res) => {
    var page = parseInt(req.query.page);
    var size = parseInt(req.query.size);
   UserService.showTicket(req.user , page , size  )
       .then((comments) => {
           res.status(200).send(comments)
       })
       .catch((err) => {
           if (err.eText) {
               if (typeof err.eText !== 'string') {
                   err.eText = err.eText.toString()
               }
           } else {
               err.eCode = 500
               err.eText = err
           }
           res.status(err.eCode).send({
               success: false,
               error: err.eText.toString()
           })
       })
});

router.get('/showComment', utils.auth, (req, res) => {
    var page = parseInt(req.query.page);
    var size = parseInt(req.query.size);

    UserService.showComment(req.headers.ticket_id  , page , size )
        .then((comment) => {
            res.status(200).send({comment: comment})
        })
        .catch((err) => {
            if (err.eText) {
                if (typeof err.eText !== 'string') {
                    err.eText = err.eText.toString()
                }
            } else {
                err.eCode = 500
                err.eText = err
            }
            res.status(err.eCode).send({
                success: false,
                error: err.eText.toString()
            })
        })

});


module.exports = router;