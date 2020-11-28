const PostModel = require('../models/post')
const ids = require('short-id')

const postController = {}

// Get post by Id
postController.getPost = (req, res) =>{

    let postShortId = req.params.shortId

    PostModel.findOne({
        shortId: postShortId, 
        isDeleted: false
    })
    .then((result) => {
        return res.json(result)
    })
    .catch((err) => {
        return res.status(500).json({
            message: err
        })
    })

}

//Get All post by User
postController.getAllUserPosts = (req, res) => {
    
    PostModel.find({_author: req.body.username, isDeleted: false}).sort({createAt: -1})
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

//Get post By Topic
postController.getAllPostsByTopic = (req, res) => {

    PostModel.find({topic: req.body.topic, isDeleted: false}).sort({createAt: -1})
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

//Get post by Title Partial
postController.getAllPostsByTitle = (req, res) => {
    PostModel.find({title: {$regex: req.body.title, $options: "i"}}).sort({createAt: -1})
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


