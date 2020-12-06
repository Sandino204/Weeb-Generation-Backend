const express = require('express')
const commentPostController = require('../Controllers/commentPostController')
const router = express.Router()
const CommentPostController = require("../Controllers/commentPostController")

function auth(req, res, next){

    if(!req.user){
  
      var err = new Error('You Are not autenticated!')
      err.status = 403
      return next(err)
  
    }else{
  
      next()
  
    }
  
}

router.get('/:shortId', CommentPostController.getComment)
router.get('/:postId/all', commentPostController.getAllPostComments)
router.post('/submit', auth, commentPostController.submitNewComment)
router.post('/delete', auth, commentPostController.deleteComment)


module.exports = router