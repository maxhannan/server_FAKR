/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const TwitterStrategy = require('passport-twitter');
const GitHubStrategy = require('passport-github');
const bcrypt = require('bcryptjs');
const PassportLocal = require('passport-local').Strategy;

const User = require('../models/User');
const {
  TWITTER_CONSUMER_KEY,
  TWITTER_SECRET,
  GITHUB_CONSUMER_KEY,
  GITHUB_SECRET,
} = require('../config');

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser((id, done) => {
  User.findById(id, (err, doc) => done(null, doc));
});

// PASSPORT STRATEGIES
passport.use(
  new PassportLocal((username, password, done) => {
    // eslint-disable-next-line
    User.findOne({ username }, (err, user) => {
      if (err) throw err;
      if (!user) return done(null, false);
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) throw err;
        if (result === true) {
          return done(null, user);
        }
        return done(null, false);
      });
    });
  }),
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_SECRET,
      callbackURL: 'http://localhost:4000/auth/twitter/callback',
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOne({ twitterID: profile.id }, async (err, doc) => {
        if (err) {
          return cb(err, null);
        }
        if (!doc) {
          const newUser = new User({
            twitterID: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            photos: profile.photos[0].value,
          });
          await newUser.save();
          return cb(null, newUser);
        }
        return cb(null, doc);
      });
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CONSUMER_KEY,
      clientSecret: GITHUB_SECRET,
      callbackURL: 'http://localhost:4000/auth/github/callback',
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOne({ githubID: profile.id }, async (err, doc) => {
        if (err) {
          return cb(err, null);
        }
        if (!doc) {
          const newUser = new User({
            githubID: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            photos: profile.photos[0].value,
          });
          await newUser.save();
          return cb(null, newUser);
        }
        return cb(null, doc);
      });
    },
  ),
);
module.exports = passport;
