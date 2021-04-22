const express = require('express');
const {
  ApolloServer,
  gql,
  AuthenticationError,
} = require('apollo-server-express');
const {
  MONGODB,
  TWITTER_CONSUMER_KEY,
  TWITTER_SECRET,
  GITHUB_CONSUMER_KEY,
  GITHUB_SECRET,
} = require('./config');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const TwitterStrategy = require('passport-twitter');
const GitHubStrategy = require('passport-github');
const SocialUser = require('./models/SocialUser');

const PORT = 4000;
const app = express();
const path = '/graphql';
// MIDDLEWARE
app.use(express.json());
app.use('*', cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(
  session({
    secret: 'maxiboy',
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

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
      console.log(profile._json.repos_url);
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

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:3000/feed');
  },
);

app.get('/auth/github', passport.authenticate('github'));

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:3000/feed');
  },
);

app.get('/getuser', (req, res) => {
  res.send(req.user);
});

app.get('/auth/logout', (req, res) => {
  if (req.user) {
    req.logout();
    res.send('done');
  }
});

// APOLLO SERVER STUFF
const typeDefs = gql`
  type User {
    id: ID!
    githubID: String
    twitterID: String
    displayName: String
    photos: String
    username: String!
  }
  type Query {
    getCurrentUser: User!
  }
`;

const resolvers = {
  Query: {
    getCurrentUser: async (_, args, context) => {
      return context.user;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const { user } = req;
    if (!user) {
      throw new AuthenticationError('No Access!');
    } else {
      return {
        user: req.user,
      };
    }
  },
});
server.applyMiddleware({
  app,
  cors: { origin: 'http://localhost:3000', credentials: true },
});

mongoose
  .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Mongo Connected');
  })
  .then(() => {
    app.listen({ port: PORT }, () =>
      console.log(
        `🚀 GQL Server ready at http://localhost:4000${server.graphqlPath} `,
      ),
    );
  });
