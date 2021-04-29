const { AuthenticationError, UserInputError } = require('apollo-server-errors');
const Post = require('../../models/Post');

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { user } = context;

      if (body.trim() === '') {
        throw new UserInputError('Empty Comment', {
          errors: {
            body: 'Comment body must not be empty',
          },
        });
      }
      const post = await Post.findById(postId);

      if (post) {
        post.comments.unshift({
          body,
          username: user.username,
          userPhoto: user.photos,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      }
      throw new UserInputError('Post not found');
    },
    async deleteComment(_, { postId, commentId }, context) {
      const { username } = context.user;

      const post = await Post.findById(postId);

      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);

        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        }
        throw new AuthenticationError('Action not allowed');
      } else {
        throw new UserInputError('No Post found');
      }
    },
  },
};
