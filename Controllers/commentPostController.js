const CommentPostModel = require('../models/commentPost')
const PostModel = require('../models/post')
const ids = require('short-id');
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

const commentPostController = {}

//Get Methods


commentPostController.getComment = (req, res) => {
    const commentShortId = req.params.shortId;

    CommentPostModel.findOne({shortId: commentShortId})
    .then((result) => {
        PostModel.findById(result._post)
        .then((parentPost) => {
            return res.status(200).json({
                success: true, 
                data: result, 
                parentPost
            })
        })
        .catch((err) => {
            return res.status(500).json({
                message: err
            })
        })

    }).catch((err) => {
        return res.status(500).json({
            message: err
        })
    })
}

//Retrieve all comments of a specific Post
commentPostController.getAllPostComments = (req, res) => {
    CommentPostModel.find({_post: req.params.postId, isDeleted: false})
    .then((result) => {
        return res.status(200).json({
            success: true, 
            data: result
        })
    })
    .catch((err) => {
        return res.status(500).json({
            message: err
        })
    })
}

//Post methods
// Create a Post comment
commentPostController.submitNewComment = (req, res) => {
    const text = req.body.text
    const postId = req.params.postId
    const shortId = ids.generate()
    const userId = req.user._id

    while(shortIdExists(shortId)){
        shortId = ids.generate()
    }

    PostModel.findOne({ shortId: postId})
    .then((post) => {
        const newComment = new CommentPostModel({
            shortId, 
            text, 
            _author: userId, 
            _post: post.id
        })

        newComment.save()
        .then((result) => {
            PostModel.findByIdAndUpdate(
                postId, 
                {
                    $push: {
                        _comments: newComment._id
                    }
                }
            )
            .then((parent) => {
                return res.status(200).json({
                    success: true, 
                    data: result, 
                    parent
                })
            })
            .catch((err) => {
                return res.status(500).json({
                    message: err
                })
            })
        })
        .catch((err) => {
            return res.status(500).json({
                message: err
            })
        })

    })
    .catch((err) => {
        return res.status(500).json({
            message: err
        })
    })
}

// Delete a Post comment

commentPostController.deleteComment = (req, res) => {
    let shortId = req.body.shortId
    let userId = req.user._id

    CommentPostModel.findOneAndUpdate(
        {
            shortId, 
            _author: userId
        }, 
        {
            $set: {
                isDeleted: true
            }
        }, 
        {
            new: true
        }
    )
    .then((result) => {
        return res.status(200).json({
            success: true, 
            data: result, 
            message: 'Comment Deleted'
        })
    })
    .catch((err) => {
        return res.status(500).json({
            success: false, 
            message: 'Error to delete a comment'
        })
    })
}

const shortIdExists = (shortId) => {
    let result = false
    CommentPostModel.findOne({ shortId })
    .then((post) => {
        if (post){
            result = true
        }
    })
    return result
}

module.exports = commentPostController;