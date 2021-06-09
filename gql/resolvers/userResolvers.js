const { UserInputError } = require('apollo-server-core');
const User = require('../../models/User');

module.exports = {
  Query: {
    getCurrentUser: async (_, args, context) => context.user,
    getUserByName: async (_, { username }) => {
      try {
        console.log('POLL');
        console.log(username);
        const user = await User.findOne({ username });
        if (user) {
          return user;
        }
        return 'no user found';
      } catch (error) {
        return error;
      }
    },
  },
  Mutation: {
    async followUser(_, { username }, context) {
      const { user } = context;
      const followingUser = await User.findOne({ username: user.username });
      const targetUser = await User.findOne({ username });
      if (targetUser) {
        if (
          targetUser.followers.find(
            (follower) => follower.username === user.username,
          )
        ) {
          // User already followed, unfollow
          followingUser.following = followingUser.following.filter(
            (follow) => follow.username !== targetUser.username,
          );
          targetUser.followers = targetUser.followers.filter(
            (follower) => follower.username !== user.username,
          );
        } else {
          // Not liked, like post
          followingUser.following.push({
            username: targetUser.username,
            photos: targetUser.photos,
            displayName: targetUser.displayName,
          });
          targetUser.followers.push({
            username: user.username,
            photos: user.photos,
            displayName: user.displayName,
          });
        }
        await followingUser.save();
        await targetUser.save();
        return followingUser;
      }
      throw new UserInputError('User not found');
    },
  },
};
