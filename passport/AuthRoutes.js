const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/twitter', passport.authenticate('twitter'));

router.get(
  '/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:3000/feed');
  },
);

router.get('/github', passport.authenticate('github'));

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
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
