const { UserInputError } = require('apollo-server-core');
const User = require('../../models/User');

module.exports = {
  Query: {
    getCurrentUser: async (_, args, context) => context.user,
    getUserByName: async (_, { username }) => {
      try {
        const user = await User.findOne({ username });
        if (user) {
          return user;
        }
      } catch (error) {
        throw new UserInputError(error);
      }
    },
  },
};
