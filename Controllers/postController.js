const PostModel = require('../models/post')
const ids = require('short-id')
const mongoose = require('mongoose')

const postController = {}

mongoose.Promise = global.Promise
//Get Methods

// Get post by Id
postController.getPost = (req, res) =>{

    let postShortId = req.params.shortId

    PostModel.findOne({
        shortId: postShortId, 
        isDeleted: false
    })
    .exec(function(err, result){
        if(!err){
            return res.status(200).json({
                success: true, 
                data: result
            })
        }

        return res.status(500).json({
            message: err
        })

    })

}

//Get All post by User
postController.getAllUserPosts = (req, res) => {
    const sortType = req.body.sortType 
    const user = req.body.user

    if(sortType == 'Data'){
        PostModel.find({_author: user, isDeleted: false})
        .sort({createAt: -1})
        .exec(function(err, result){
            if(!err){
                return res.status(200).json({
                    success: true, 
                    data: result
                })
            }

            return res.status(500).json({
                message: err
            })

        })
    }

    PostModel.find({_author: user, isDeleted: false})
    .sort({like: -1})
    .exec(function(err, result){
        if(!err){
            return res.status(200).json({
                success: true, 
                data: result
            })
        }

        return res.status(500).json({
            message: err
        })

    })


} 

//Get post By Topic
postController.getAllPostsByTopic = (req, res) => {
    
    const sortType = req.body.sortType 
    const topic = req.body.topic

    if(sortType == 'Data'){
        PostModel.find({topic: topic, isDeleted: false})
        .sort({createAt: -1})
        .exec(function(err, result){
            if(!err){
                return res.status(200).json({
                    success: true, 
                    data: result
                })
            }

            return res.status(500).json({
                message: err
            })

        })
    }

    PostModel.find({topic: topic, isDeleted: false})
    .sort({like: -1})
    .exec(function(err, result){
        if(!err){
            return res.status(200).json({
                success: true, 
                data: result
            })
        }

        return res.status(500).json({
            message: err
        })

    })

}

//Get post by Title Partial
postController.getAllPostsByTitle = (req, res) => {
    
    const sortType = req.body.sortType 
    const title = req.body.title

    if(sortType == 'Data'){
        PostModel.find({title: {$regex: req.body.title, $options: "i"}})
        .sort({createAt: -1})
        .exec(function(err, result){
            if(!err){
                return res.status(200).json({
                    success: true, 
                    data: result
                })
            }

            return res.status(500).json({
                message: err
            })

        })
    }
    
    PostModel.find({title: {$regex: req.body.title, $options: "i"}})
    .sort({like: -1})
    .exec(function(err, result){
        if(!err){
            return res.status(200).json({
                success: true, 
                data: result
            })
        }

        return res.status(500).json({
            message: err
        })

    })

}

// get all posts

postController.getAll = (req, res) => {

    const sortType = req.body.sortType 

    if(sortType == 'Data'){
        PostModel.find({isDeleted: false})
        .sort({createAt: -1})
        .exec(function(err, result){
            if(!err){
                return res.status(200).json({
                    success: true, 
                    data: result
                })
            }

            return res.status(500).json({
                message: err
            })

        })
    }

    PostModel.find({isDeleted: false})
    .sort({like: -1})
    .exec(function(err, result){
        if(!err){
            return res.status(200).json({
                success: true, 
                data: result
            })
        }

        return res.status(500).json({
            message: err
        })

    })
    

}


//Post Methods

//Submit new post
postController.submitNewPost = (req, res) => {
    const title = req.body.title
    const topic = req.body.topic
    const text = req.body.text
    const userId = req.user._id;

    let shortId = ids.generate()

    while(shortIdExists(shortId)){
        shortId = ids.generate()
    }

    const newPost = new PostModel({
        shortId, 
        title, 
        topic, 
        text, 
        _author : userId
    })

    newPost.save()
    .then((result) => {
        return res.status(200).json({
            success: true, 
            data: result
        })
    })
    .catch((err) => {
        return res.status(500)
        .json({
            message: err
        })
    })
}

//Edit existing post
postController.editPost = (req, res) => {
    
    const text = req.body.text
    const title = req.body.title
    const shortId = req.body.shortId
    const userId = req.user._id

    if(!text && title){
        PostModel.findOneAndUpdate(
            {
                shortId: shortId, 
                _author: userId
            }, 
            {
                $set:{
                    title: title
                }
            }
        ).then((edited) => {
            return res.status(200).json({
                success: true, 
                data: edited, 
                message: 'Post Edited'
            })
        }).catch((err) => {
            return res.status(500).json({
                success: true, 
                data: err, 
                message: 'Edit failed'
            })
        })
    }else if(text && !title){
        PostModel.findOneAndUpdate(
            {
                shortId: shortId, 
                _author: userId
            }, 
            {
                $set:{
                    text: text
                }
            }
        ).then((edited) => {
            return res.status(200).json({
                success: true, 
                data: edited, 
                message: 'Post Edited'
            })
        }).catch((err) => {
            return res.status(500).json({
                success: true, 
                data: err, 
                message: 'Edit failed'
            })
        })
    }else if(text && title){
        PostModel.findOneAndUpdate(
            {
                shortId: shortId, 
                _author: userId
            }, 
            {
                $set:{
                    title: title,
                    text: text
                }
            }
        ).then((edited) => {
            return res.status(200).json({
                success: true, 
                data: edited, 
                message: 'Post Edited'
            })
        }).catch((err) => {
            return res.status(500).json({
                success: true, 
                data: err, 
                message: 'Edit failed'
            })
        })
    }else{
        return res.status(500).json({
            success: true, 
            data: err, 
            message: 'Edit failed'
        })
    }

}

// Delet Post
postController.deletPost = (req, res) => {
    let shortId = req.body.shortId
    let userId = req.user._id

    PostModel.findOneAndUpdate(
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
    .then((deleted) => {
        return res.status(200).json({
            success: true, 
            data: deleted, 
            message: 'Post deleted'
        })
    })
    .catch((err) => {
        return res.status(500).json({
            success: false, 
            data: err, 
            message: "Something goes Wrong"
        })
    })
}

//Helper functions

const shortIdExists = (shortId) => {
    let result = false
    PostModel.findOne({shortId})
    .then((post) => {
        if(post){
            result = true
            return result = true
        }
    })
    .catch((err) => {
        console.log(err)
    })
    return result
}


module.exports = postController