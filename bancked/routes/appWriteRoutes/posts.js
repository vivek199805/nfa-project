  const  express = require("express");
  const Post = require('../models/post');
  const generateCounter = require("../../utils/counter.util");
  // const PostController = require("../controllers/posts");
  const extractFile = require("../middleware/file");

 const multer = require("multer");
  const checkAuth = require("../middleware/check-auth");

   const router = express.Router();
  //  router.use("/images", express.static(path.join("backend/images")));

// add post data to the databsae
   router.post("",  extractFile, async(req, res, next) => {
    const Id = await generateCounter('postval')
       const url = req.protocol + '://' + req.get("host");
    //connect to the database
     const post = new Post({
         _id:Id,
        title: req.body.title,
        content:req.body.content,
        imagePath: url + "/images/" + req?.file?.filename,
        // creator: req.userData.userId
     });
     
    //  console.log(post);
      post.save().then(createdPost => {
        // console.log(createdPost);
       res.status(201).json({
           message: 'Post added successfully',
           post: {
            ...createdPost,  //this is spread Operator
            id: createdPost._id
          }
       });
      })
      .catch(error => {
        res.status(500).json({
          message: "Creating a post failed!"
        });
      });  
  });
  
  
    router.put("/:id", extractFile, (req, res, next) => {
          var imagePath = req.body.imagePath;
    if(req?.file) {
      const url = req.protocol + '://' + req.get("host");
      imagePath: url + "/images/" + req.file.filename
     }
      const post = new Post({
                _id: req.body.id,
               title: req.body.title,
               content:req.body.content,
               imagePath: imagePath
              //  creator: req.userData.userId
            });
     Post.updateOne({_id: req.params.id}, post).then(result => {
          console.log(result);              
          res.status(200).json({message:"Post updated successfully"});              
           })
           .catch(error => {
            res.status(500).json({
              message: "Couldn't update  a post!"
            });
          });
        });     
        

  router.get("", (req, res, next) => {
      //fetching data from databases
   Post.find().then(documents => {
       res.status(200).json({
        message:'posts fetched successfully',
        posts: documents
    });
  });
  });


  router.get("/:id", (req, res, next) => {
    Post.findById(req.params.id).then(post => {
        if(post) {
            res.status(200).json(post);
        }else {
           res.status(404).json({message: 'Page not found'});
        }
    }).catch(error => {
      res.status(500).json({
        message: "Fetching post failed!"
      });
    });
  });   

// delete post data byId
  router.delete("/:id", (req, res, next) => {
    Post.deleteOne({_id: req.params.id}).then(result => {
        console.log(result);
        if (result.deletedCount > 0) {
            res.status(200).json({message:"Delation successfully"});
       }
       else{
        res.status(401).json({message:"not authorized"});
       }
      })         
      .catch(error => {
         res.status(500).json({
        message: "Fetching post failed!"
      });
    });
  });

module.exports = router;

//  router.get("/api/posts", (req, res, next) => {
//      const pageSize = +req.query.pagesize;
//      const currentPage = +req.query.page;
//      const postQuery = Post.find();
//      let fetchedPosts;
//      if (pageSize && currentPage) {
//        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
//      }
//       postQuery.then(documents => {
//         fetchedPosts = documents;
//         return Post.count();
//       })
//       .then(count => {
//         res.status(200).json({
//             message:'posts fetched successfully',
//             posts: fetchedPosts,
//             maxPosts: count
//         });
//    })
//    .catch(error => {
//     res.status(500).json({
//       message: "Fetching post failed!"
//     });
//   });
// });


    //  ==================for controllers folder================

// router.post("/api/posts", checkAuth, extractFile, PostController.createPost);
// router.put("/api/posts/:id", checkAuth, extractFile, PostController.updatePost);
// router.get("/api/posts", PostController.getPosts);
// router.get("/api/posts/:id", PostController.getPost);
// router.delete("/api/posts/:id", checkAuth, PostController.deletePost);