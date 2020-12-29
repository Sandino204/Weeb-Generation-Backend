var express = require('express');
const bodyParser = require('body-parser')
var User = require('../models/user')
var passport = require('passport')
var session = require('express-session')
var async = require('async')
var fs = require('fs')
var path = require('path')
var multer = require('multer')

var crypto = require('crypto')
const sgMail = require('@sendgrid/mail');
const { findById, update } = require('../models/user');
sgMail.setApiKey('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')

var router = express.Router();

var router = express.Router()
router.use(bodyParser.json())
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', function(req, res, next){
  User.register(new User({username: req.body.username, email: req.body.email}), 
    req.body.password, (err, user) =>{
    if(err){
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.json({err: err})
    }else{
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json({success: true, status: 'Registration Successful!'})
      })
    }  
  })
})

router.post('/login', passport.authenticate('local') , (req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({success: true, status: 'You are successfully logged in'})
})

router.get('/isLogged', (req, res) => {
  
  if(!req.user){

    var err = new Error('You Are not autenticated!')
    err.status = 403
    return res.json({
      logged: false, 
    })

  }else{
    User.findById(req.user)
    .then((user) => {
      return res.status(200).json({
        logged: true,
        user: user 
      })  
    })
  }

})

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  }, 
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({storage: storage})


router.put('/changeImage', upload.single('image'), (req, res, next) => {
  var obj = {
    data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
    contentType: 'image/png' 
  }

  User.findByIdAndUpdate(req.user, {img: obj}, {new: true}, function(err, docs){
    if(err){
      return res.status(500).json({
        success: false
      })
    }else{
      return res.status(200).json({
        success: true
      })
    }
  })
})

router.get('/logout', (req, res, next) => {
  if(req.session){
    req.session.destroy();
    res.clearCookie('session-id')
    res.redirect('/')
  }

  var err = new Error('You are not logged in!')
  err.status = 403
  next(err)
  
})

router.post('/forgot', function(req, res, next){
  async.waterfall([
    function(done){
      crypto.randomBytes(20, function(err, buf){
        const token = buf.toString('hex')
        done(err, token)
      })
    }, 
    function(token, done){
      User.findOne({ email: req.body.email}, function(err, user){
        if(!user){
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.json({err: 'Email Not Found'})

          return 
        }

        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 3600000 

        user.save(function(err){
          done(err, token, user)
        })
      })
    }, 
    function(token, user, done){
      const msg = {
        to: user.email, 
        from: 'khaosenterprise@gmail.com',
        subject: 'Password Reset from ManaWars', 
        text: 'Você está recebendo isto porque você (ou outra pessoa) solicitou a redefinição da senha de sua conta. \n \n' +
        'Clique no link a seguir ou cole-o em seu navegador para concluir o processo: \n \n' +
        'http: //' + 'localhost / 3001' + '/ reset /' + token + '\n \n' +
        'Se você não solicitou isso, ignore este e-mail e sua senha permanecerá inalterada. \n'
      }

      sgMail.send(msg)
      .then(() => {
        res.statusCode = 200, 
        res.setHeader('Content-Type', 'application/json')
        res.json({success: true, status: 'An Email is send to your email to change your Password'})
      })
      .catch((error) => {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.json({err: error})
      })
    }
  ], 
   function(err){
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.json({err: 2})
   })
})

router.put('/reset/:token', function(req, res){
  
  async.waterfall([
    function(done){
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },
      function(err, user){
      if(!user){
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.json({err: 1})
      }

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      user.save(function(err){
        done(err, user)
      }) 
    })
    }, 
    function(user, done){
      const msg = {
        to: user.email, 
        from: 'khauscorpgames@gmail.com',
        subject: 'Password Reset from ManaWars', 
        text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      }

      sgMail.send(msg)
      .then(() => {
        res.statusCode = 200, 
        res.setHeader('Content-Type', 'application/json')
        res.json({success: true, status: 'Your password is changed'})
      })
      .catch((error) => {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.json({err: error})
      })

    }
  ], function(err){
    res.json({err: err})
  })
})


module.exports = router;