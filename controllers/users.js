const _ = require('lodash');
const { User, validateRegistration, validateLogin } = require('../models/users');
const bcrypt = require('bcrypt');

// module.exports.signup_get= async (req, res) => {
//   res.render('signup');  
// };

module.exports.signup_post= async (req, res) => {
  const { error } = validateRegistration(req.body);
  if (error) return res.status(400).json({"ERROR": error.details[0].message});

  let user = await User.findOne({ email: req.body.email });
  if(user)    return res.status(400).json({"ERROR":'User is already registered with this email'});

  user = new User(_.pick(req.body, ['username', 'email', 'password']));

  const result = await user.save();
  console.log(result);
  const token = user.generateAuthToken(); // check user.js under model folder

  const maxAge = 1 * 60 * 60;
  res.cookie('jwt', token, {httpOnly: true/*, maxAge: maxAge*1000*/});
  const userInfo=_.pick(user, ['_id', 'username', 'email']);

  //res.header('x-auth-token', token).status(201).json({SUCCESS: "User registered successfully!"});
  //res.status(201).json(_.pick(req.body, ['name', 'email', 'password']));
  res.status(201).json({SUCCESS: "User registered successfully!"/*, user: userInfo, token: token*/});
}

module.exports.signin_post= async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json({"ERROR": error.details[0].message});
  
  const { email, password } = req.body;
  
  let user = await User.findOne({ email });
  if(!user)  return res.status(400).json({"ERROR": 'Invalid email or password!'});
    
  const validPassword = await bcrypt.compare(password, user.password);
  if(!validPassword)  return res.status(400).json({"ERROR": 'Invalid email or password!'});
  
  const token = user.generateAuthToken(); // check user.js model
  const maxAge = 1 * 60 * 60;
  res.cookie('jwt', token, {httpOnly: true/*, maxAge: maxAge*1000*/});
  const userInfo=_.pick(user, ['_id', 'username', 'email']);
  //res.header('x-auth-token', token).status(201).json({SUCCESS: user.name+' has successfully signed in.', user: userInfo});
  res.status(201).json({SUCCESS: user.name+' has successfully signed in.', user: userInfo, token: token});
}

module.exports.signout_get = async (req, res) => {
  res.cookie('jwt', ''/*, {maxAge:1}*/);
  //res.redirect('/');
  res.headers['x-auth-token']='';
  res.json({SUCCESS: "logged out successfully!"});
}