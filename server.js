const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('./passport/passport');
const AuthRoutes = require('./passport/AuthRoutes');
const { ApolloServer, AuthenticationError } = require('apollo-server-express');

const typeDefs = require('./gql/typeDef');
const resolvers = require('./gql/resolvers/');
const { MONGODB, SECRET_KEY } = require('./config');

const PORT = 4000;
const app = express();
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
// MIDDLEWARE
app.use(express.json());
app.use(cors(corsOptions));

app.use(
  session({
    secret: SECRET_KEY,
    resave: true,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth/', AuthRoutes);

// APOLLO SERVER
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

server.applyMiddleware({ app, cors: corsOptions });

const startServer = async () => {
  await mongoose.connect(MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Mongo Connected');
  await app.listen({ port: PORT });
  console.log(
    `🚀 GQL Server ready at http://localhost:4000${server.graphqlPath} `,
  );
};

startServer();
