const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { SECRET } = require('../config');

/********** @RegisterUser **********/
const register = async (userData, role, res) => {
  //  validate the user
  let usernameTaken = await validateUser(userData.username);
  if (usernameTaken) {
    return res.status(400).json({
      message: 'Username is already taken',
      success: false,
    });
  }

  //  validate the email
  let emailRegistered = await validateEmail(userData.email);
  if (emailRegistered) {
    return res.status(400).json({
      message: 'Email is already registered',
      success: 0,
    });
  }

  const newUser = new User({
    ...userData,
    role,
  });

  try {
    await newUser.save();
    return res.status(201).json({
      message: 'User created',
      success: 1,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'User not created',
      success: 0,
    });
  }
};

const login = async (userCreds, role, res) => {
  let { username, password } = userCreds;

  //  checking if user exists
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({
      message: 'Username not found',
      success: 0,
    });
  }

  if (user.role !== role) {
    return res.status(403).json({
      message: 'Incorrect portal used',
      success: 0,
    });
  }

  let passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
    //  sign in the token and issue it to the user
    let tokenValidity = 60 * 60 * 24 * 28; // sec * min * hour * day = 1 month validity
    let token = await jwt.sign(
      {
        user_id: user._id,
        role: user.role,
        username: user.username,
        email: user.email,
      },
      SECRET,
      { expiresIn: tokenValidity, algorithm: 'HS256' }
    );

    let result = {
      username: user.username,
      role: user.role,
      email: user.email,
      token: `Bearer ${token}`,
      expiresIn: tokenValidity,
    };

    return res.status(200).json({
      ...result,
      message: 'Logged in successfully',
      success: 1,
    });
  } else {
    return res.status(403).json({
      message: 'Incorrect password',
      success: 0,
    });
  }
};

const validateUser = async (userName) => {
  let user = await User.findOne({ userName });
  return !user ? false : true;
};

const validateEmail = async (email) => {
  let emailId = await User.findOne({ email });
  return !emailId ? false : true;
};

/********** @PassportMiddleware **********/
const userAuth = passport.authenticate('jwt', { session: false });

const checkRole = (roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : res.status(401).json({ message: 'Unauthorized', success: 0 });

module.exports = { register, login, checkRole, userAuth };
