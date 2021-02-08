const router = require('express').Router();
const { register, login, userAuth, checkRole } = require('../utils/Auth');

/**********  @REGISTRATION    **********/
//  user registration route
router.post('/registerUser', async (req, res) => {
  await register(req.body, 'user', res);
});

//  admin registration route
router.post('/registerAdmin', async (req, res) => {
  await register(req.body, 'admin', res);
});

//  superAdmin registration route
router.post('/registerSuperAdmin', async (req, res) => {
  await register(req.body, 'superAdmin', res);
});

/**********  @LOGIN    **********/
//  user login route
router.post('/loginUser', async (req, res) => {
  await login(req.body, 'user', res);
});

//  admin login route
router.post('/loginAdmin', async (req, res) => {
  await login(req.body, 'admin', res);
});

//  superAdmin login route
router.post('/loginSuperAdmin', async (req, res) => {
  await login(req.body, 'superAdmin', res);
});

/**********  @Profile    **********/

//  common profile route
router.get('/profile', userAuth, async (req, res, next) => {
  res.json({
    username: req.user.username,
    email: req.user.email,
    id: req.user._id,
    name: req.user.name,
  });
});

//  user protected route
router.post(
  '/userProfile',
  userAuth,
  checkRole(['users']),
  async (req, res) => {
    return res.json('Hello user');
  }
);

//  admin protected route
router.get(
  '/adminProfile',
  userAuth,
  checkRole(['admin']),
  async (req, res) => {
    return res.json('Hello admin');
  }
);

//  superAdmin protected route
router.get(
  '/superAdminProfile',
  userAuth,
  checkRole(['superAdmin']),
  async (req, res) => {
    return res.json('Hello superAdmin');
  }
);

//  common superAdmin and admin protected route
router.get(
  '/superAdminProfile',
  userAuth,
  checkRole(['superAdmin', 'admin']),
  async (req, res) => {
    return res.json('Hello common superAdmin and admin');
  }
);

module.exports = router;
