const router = require("express").Router();
const { Post, User } = require("../../models");
const withAuth = require("../../utils/auth");

//------------------------------------------------//
//         GET /dashboard to view all posts       //
//------------------------------------------------//

//------------------------------------------------//
//         GET /dashboard single post by id       //
//------------------------------------------------//

//------------------------------------------------//
//           POST /dashboard - Add a post         //
//------------------------------------------------//

//------------------------------------------------//
//     Delete /dashboard - Delete a post by ID    //
//------------------------------------------------//

router.delete("/post/:id", withAuth, async (req, res) => {
  Post.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbPostData) => {
      if (dbPostData) {
        res.status(200).end();
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

module.exports = router;
