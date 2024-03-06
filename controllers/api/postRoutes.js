const router = require('express').Router();
const { Post, User } = require('../../models');
const withAuth = require('../../utils/auth');

//------------------------------------------------//
//         GET /dashboard to view all posts       //
//------------------------------------------------//

router.get('/', withAuth, async (req, res) => {
  console.log(req.session);
  console.log('======================');
  Post.findAll({
    where: {
      user_id: req.session.user_id
    },
    attributes: [
      'id',
      'title',
      'post_content',
      'created_at'
    ],
    include: [
      {
        model: User,
        attributes: ['name']
      }
    ]
  })
    .then(dbPostData => {
      const posts = dbPostData.map(post => post.get({ plain: true }));
      res.render('dashboard', { posts, loggedIn: true });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});


//------------------------------------------------//
//         GET /dashboard single post by id       //
//------------------------------------------------//
router.get('/post/:id', withAuth, async (req, res) => {
  Post.findByPk(req.params.id, {
    attributes: [
      'id',
      'title',
      'post_content',
      'created_at'
    ],
    include: [
      {
        model: User,
        attributes: ['name']
      }
    ]
  })
    .then(dbPostData => {
      if (dbPostData) {
        const post = dbPostData.get({ plain: true });
        res.render('edit-post', { post, loggedIn: true });
      } else {
        res.status(404).end();
      }
    })
    .catch(err => {
      res.status(500).json(err);
    });
});



//------------------------------------------------//
//           POST /dashboard - Add a post         //
//------------------------------------------------//

router.post('/', withAuth, async (req, res) => {
  Post.create({
    title: req.body.title,
    post_content: req.body.post_content,
    user_id: req.session.user_id
  })
    .then(dbPostData => {
      res.redirect('/dashboard');
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

//------------------------------------------------//
//     Delete /dashboard - Delete a post by ID    //
//------------------------------------------------//

router.delete('/post/:id', withAuth, async (req, res) => {
  Post.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(dbPostData => {
      if (dbPostData) {
        res.status(200).end();
      } else {
        res.status(404).end();
      }
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

module.exports = router;


