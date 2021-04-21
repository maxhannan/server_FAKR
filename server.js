const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { MONGODB } = require('./config');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const PORT = 4000;

const app = express();
const path = '/gql';
// MIDDLEWARE
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(
  session({
    secret: 'maxiboy',
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID:
        '351314765576-uf1ofncpvb1g5191pp7pkbblfrl7cvml.apps.googleusercontent.com',
      clientSecret: '4tRgMXZJ9NudaD7X_rUiWUBl',
      callbackURL: '/auth/google/callback',
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      cb(null, profile);
    },
  ),
);

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile'] }),
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  },
);

// APOLLO SERVER STUFF
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app, path });

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
