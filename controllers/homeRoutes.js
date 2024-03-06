const router = require('express').Router();
const { Post, User } = require('../../models');
const withAuth = require('../../utils/auth');

//------------------------------------------------//
//                get all posts                   //
//------------------------------------------------//

router.get('/', withAuth, async (req, res) => {
    try {
        const postData = await Post.findAll({
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
        });
        
        const posts = postData.map((post) => post.get({ plain: true }));

        
        res.render('dashboard', { 
            posts, 
            loggedIn: req.session.logged_in 
        });
    } catch (err) {
        res.status(500).json(err);
    }
});


//------------------------------------------------//
//           Prevent access middleware            //
//------------------------------------------------//
router.get('/profile', withAuth, async (req, res) => {
    try {      
      const userData = await User.findByPk(req.session.user_id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Project }],
      });
  
      const user = userData.get({ plain: true });
  
      res.render('profile', {
        ...user,
        logged_in: true
      });
    } catch (err) {
      res.status(500).json(err);
    }
  });


//------------------------------------------------//
//  Redirect user to login if not logged already  //
//------------------------------------------------//

router.get('/login', (req, res) => {  
  if (req.session.logged_in) {
    res.redirect('/profile');
    return;
  }

  res.render('login');
});

module.exports = router;