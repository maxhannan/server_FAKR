/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { ApolloServer, AuthenticationError } = require('apollo-server-express');
const cookieParser = require('cookie-parser');
const generateUploadURL = require('./s3.js');

const AuthRoutes = require('./passport/AuthRoutes');
const passport = require('./passport/passport');
const typeDefs = require('./gql/typeDef');
const resolvers = require('./gql/resolvers');
const { MONGODB, SECRET_KEY } = require('./config');

const PORT = 4000;
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(SECRET_KEY));
app.use(cors(corsOptions));

// MONGODB SESSION STORE
const store = new MongoDBStore(
  {
    uri: MONGODB,
    collection: 'mySessions',
  },
  () => {
    console.log('connected session');
  },
);

app.use(
  session({
    secret: SECRET_KEY,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    },
    store,
    resave: true,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth/', AuthRoutes);

app.get('/s3Url', async (req, res) => {
  const url = await generateUploadURL();
  res.send({ url });
});

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
