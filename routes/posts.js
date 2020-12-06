const express = require('express')
const router = express.Router()
const postController = require("../Controllers/postController")

function auth(req, res, next){

    if(!req.user){
  
      var err = new Error('You Are not autenticated!')
      err.status = 403
      return next(err)
  
    }else{
  
      next()
  
    }
  
}


router.get('/:shortId', postController.getPost)
router.get('/all', postController.getAll)
router.get('/allUser', postController.getAllUserPosts)
router.get('/allTopic', postController.getAllPostsByTopic)
router.get('/allTitle', postController.getAllPostsByTitle)
router.post('/submit', auth, postController.submitNewPost)
router.put('/edit', auth, postController.editPost)
router.put('/delete', auth, postController.deletPost)

module.exports = router