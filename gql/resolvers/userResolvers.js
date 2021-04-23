module.exports = {
  Query: {
    getCurrentUser: async (_, args, context) => {
      return context.user;
    },
  },
};
