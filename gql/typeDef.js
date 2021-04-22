const { gql } = require('apollo-server-express');

module.exports = gql`
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
