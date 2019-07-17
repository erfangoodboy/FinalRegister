const {Admin} =  require('../models/Admin') ;
var express = require('express');
var multer = require('multer');
var router = express.Router();
var path = require('path');
var AdminService = require('../Services/adminServices');
var shortid = require('shortid')
const utils = require('../utils/functoin');

////// config multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        var fileInfo = path.parse(file.originalname)
        let fileName = shortid.generate() + fileInfo.name + fileInfo.ext;
        cb(null, fileName)
    }
});

var imageFilter = function (req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG)$/i)) {
        return callback(new Error('Only image files are allowed!'), false)
    }
    callback(null, true)
}

var uploadConfig = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {fileSize: 200 * 1024 * 1024}
})

var upload = uploadConfig.fields([{name: 'image', maxCount: 1}])


router.post('/register', upload, (req, res) => {
    let photo = req.files && req.files['image'] ? req.files['image'][0].filename : null

    AdminService.register(
        req.body.email,
        req.body.name,
        req.body.password,
        req.body.phone,
        photo
    ).then((admin) => {

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

router.post('/login', (req, res) => {
    AdminService.login(req, res).then((doc) => {
        res.status(200).send(doc);
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
    });
});

router.post('/edit', utils.auth, upload, (req, res) => {
    var filename = req.files['image'][0].filename;
    console.log(filename);

    AdminService.edit(req.user, req.body.name, req.body.password, filename)
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

router.post('/addDepartment', utils.adminAuth , (req , res)=>{
    AdminService.addDepartment(req.admin , req.body.name , req.body.description)
        .then(()=>{
        res.status(200).send({success: true});
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

router.post('/editDepartment' , utils.adminAuth , (req , res )=>{
    AdminService.editDept(req.admin , req.body.name , req.body.description)
        .then((doc)=>{
            res.status(200).send(doc) ;
            }
        )
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
    }
)

module.exports = router;

