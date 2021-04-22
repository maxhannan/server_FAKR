const passport = require('passport');
const TwitterStrategy = require('passport-twitter');
const GitHubStrategy = require('passport-github');
const SocialUser = require('../models/SocialUser');
const {
  TWITTER_CONSUMER_KEY,
  TWITTER_SECRET,
  GITHUB_CONSUMER_KEY,
  GITHUB_SECRET,
} = require('../config');

passport.serializeUser((user, done) => {
  return done(null, user._id);
});

passport.deserializeUser((id, done) => {
  SocialUser.findById(id, (err, doc) => {
    return done(null, doc);
  });
});

// PASSPORT STRATEGIES
passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_SECRET,
      callbackURL: 'http://localhost:4000/auth/twitter/callback',
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      SocialUser.findOne({ twitterID: profile.id }, async (err, doc) => {
        if (err) {
          return cb(err, null);
        }
        if (!doc) {
          const newUser = new SocialUser({
            twitterID: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            photos: profile.photos[0].value,
          });
          await newUser.save();
          return cb(null, newUser);
        }
        cb(null, doc);
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
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      SocialUser.findOne({ githubID: profile.id }, async (err, doc) => {
        if (err) {
          return cb(err, null);
        }
        if (!doc) {
          const newUser = new SocialUser({
            githubID: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            photos: profile.photos[0].value,
          });
          await newUser.save();
          return cb(null, newUser);
        }
        cb(null, doc);
      });
    },
  ),
);
module.exports = passport;
