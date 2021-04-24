module.exports = {
  Query: {
    getCurrentUser: async (_, args, context) => context.user,
  },
};
