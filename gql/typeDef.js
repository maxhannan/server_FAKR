const { gql } = require('apollo-server-express');

module.exports = gql`
  type Post {
    id: ID!
    postType: String!
    title: String!
    body: String!
    liveLink: String!
    repoLink: String!
    photoURL: String!
    createdAt: String!
    username: String!
    userDisplayName: String!
    userPhoto: String!
    likes: [Like]!
    likeCount: Int!
    comments: [Comment]!
    commentCount: Int!
  }
  type Like {
    id: ID!
    createdAt: String!
    username: String!
    userPhoto: String!
  }
  type Comment {
    id: ID!
    createdAt: String!
    username: String!
    body: String!
    userPhoto: String!
  }
  type User {
    id: ID!
    displayName: String
    photos: String
    username: String!
    followers: [User]
    following: [User]
  }
  type Query {
    getCurrentUser: User!
    getUserByName(username: String!): User!
    getPosts: [Post]
    getPostsByUser(username: String!): [Post]
    getPost(postId: ID!): Post
  }

  type Mutation {
    createPost(
      postType: String!
      title: String!
      body: String!
      liveLink: String!
      repoLink: String!
      photoURL: String!
    ): Post!
    followUser(username: String!): User!
    deletePost(postId: ID!): String!
    likePost(postId: ID!): Post!
    createComment(postId: ID!, body: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
  }
`;
