const mongoose = require('mongoose')
const BeautifullUnique = require('mongoose-beautiful-unique-validation')

const Schema = mongoose.Schema

mongoose.Promise = global.Promise

const Post = new Schema({
    shortId:{
        type: String, 
        unique: false
    }, 
    title: {
        type: String, 
        required: true, 
        maxlength: 25
    },
    topic:{
        type: String, 
        default: 'Outros'
    },  
    text: {
        type: String
    }, 
    isDeleted: {
        type: Boolean, 
        default: false
    }, 
    createAt:{
        type: Date, 
        default: Date.now
    },
    like: {
        type: Number, 
        default: 0
    }, 
    isFixed: {
        type: Boolean, 
        default: false
    },
    _author: {
        type: Schema.ObjectId, 
        ref: 'User', 
        required: true
    },
    _comments: [
        {
            type: Schema.ObjectId,
            ref: 'comment'
        }
    ]
})

const populateAuthor = function(next){
    this.populate({
        path: '_author', 
        select: 'username img'
    })
    next()
}

const populateComments = function(next){
    this.populate({
        path: '_comments',
        select: '_author createdAt isDeleted text _post shortId like'
    })

    next()
}

Post.pre('find', populateAuthor);
Post.pre('findOne', populateAuthor)
Post.pre('find', populateComments)
Post.pre('findOne', populateComments)

const PostM = mongoose.model('Post', Post)

module.exports = PostM