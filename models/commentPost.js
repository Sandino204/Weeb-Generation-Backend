const mongoose = require('mongoose')

const Schema = mongoose.Schema

mongoose.Promise = global.Promise

const CommentPostSchema = new Schema({
    shortId: {
        type: String,
        unique: true
    }, 
    text:{
        type: String, 
        required: true
    }, 
    isDeleted: {
        type: Boolean, 
        default: false
    }, 
    createdAt: {
        type: Date, 
        default: Date.now
    }, 
    postLink: {
        type: String, 
        required: true
    },
    like: {
        type: Number, 
        default: 0
    }, 
    _author: {
        type: Schema.ObjectId, 
        ref: 'User', 
        required: true
    }, 
    _post:{
        type: Schema.ObjectId, 
        ref: 'Post'
    }
})

const populateAuthor = function(next){
    this.populate({
        path: '_author', 
        select: 'username', 
        match: {
            'isDeleted': false
        }
    })
}

CommentPostSchema.pre('find', populateAuthor)
CommentPostSchema.pre('findOne', populateAuthor)

const Comment = mongoose.model('Comment', CommentPostSchema)

module.exports = Comment