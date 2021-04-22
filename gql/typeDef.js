const { gql } = require('apollo-server-express');

module.exports = gql`
  type Post {
    id: ID!
    body: String!
    createdAt: String!
    username: String!
    likes: [Like]!
  }
  type Like {
    id: ID!
    createdAt: String!
    username: String!
  }

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
    getPosts: [Post]
    getPost(postId: ID!): Post
  }

  type Mutation {
    createPost(body: String!): Post!
    deletePost(postId: ID!): String!
    likePost(postId: ID!): Post!
  }
`;
