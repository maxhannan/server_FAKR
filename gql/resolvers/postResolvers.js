/* eslint-disable object-curly-newline */
const { AuthenticationError, UserInputError } = require('apollo-server-errors');
const Post = require('../../models/Post');

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPostsByUser(_, { username }) {
      try {
        const posts = await Post.find({ username }).sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        }
        throw new Error('Post not found');
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    async createPost(
      _,
      { postType, title, body, liveLink, repoLink, photoURL },
      context,
    ) {
      const { user } = context;

      if (body.trim() === '') {
        throw new Error('Post body must not be empty');
      }

      const newPost = new Post({
        postType,
        title,
        body,
        liveLink,
        repoLink,
        photoURL,
        user: user.id,
        username: user.username,
        userPhoto: user.photos,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();

      return post;
    },
    async deletePost(_, { postId }, context) {
      const { user } = context;
      try {
        const post = await Post.findById(postId);
        if (user.username === post.username) {
          await post.delete();
          return 'Post deleted successfully';
        }
        throw new AuthenticationError('Action not allowed');
      } catch (err) {
        throw new Error(err);
      }
    },
    async likePost(_, { postId }, context) {
      const { username } = context.user;

      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          // Post already likes, unlike it
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          // Not liked, like post
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }

        await post.save();
        return post;
      }
      throw new UserInputError('Post not found');
    },
  },
};
