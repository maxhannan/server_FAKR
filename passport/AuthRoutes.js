const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

const router = express.Router();

router.post('/login', (req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  passport.authenticate('local', (err, user, info) => {
    if (err) throw err;
    if (!user) res.send('No User Exists');
    else {
      req.logIn(user, (error) => {
        if (error) throw error;
        res.send('success');
      });
    }
  })(req, res, next);
});

router.post('/register', (req, res) => {
  User.findOne({ username: req.body.username }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send('User already exists');
    if (!doc) {
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        username: req.body.username,
        password: hashPassword,
        displayName: req.body.displayName,
      });
      await newUser.save();
      res.send('success');
    }
  });
});

router.get('/twitter', passport.authenticate('twitter'));

router.get(
  '/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:3000/feed');
  },
);

router.get('/github', passport.authenticate('github'));

router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:3000/feed');
  },
);

router.get('/getuser', (req, res) => {
  res.send(req.user);
});

router.get('/logout', (req, res) => {
  if (req.user) {
    req.logout();
    res.send('done');
  }
});

module.exports = router;
