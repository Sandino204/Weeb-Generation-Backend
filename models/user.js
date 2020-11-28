var mongoose = require('mongoose')
var passport = require('passport')
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')

var User = new Schema({
    email: {
        type: String, 
        required: true
    }, 
    resetPasswordToken:{
        type: String, 
    },
    resetPasswordExpires:{
        type: Date, 
    },
    isDeleted:{
            type: Boolean, 
            default: false
    }, 
    admin: {
        type: Boolean, 
        required: true, 
        default: false
    }
})

User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User)