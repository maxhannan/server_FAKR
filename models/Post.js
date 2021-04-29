const { model, Schema } = require('mongoose');

const postSchema = new Schema({
  postType: String,
  title: String,
  body: String,
  liveLink: String,
  repoLink: String,
  photoURL: String,
  username: String,
  userPhoto: String,
  userDisplayName: String,
  createdAt: String,
  likes: [
    {
      username: String,
      userPhoto: String,
      createdAt: String,
    },
  ],
  comments: [
    {
      body: String,
      username: String,
      createdAt: String,
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
});

module.exports = model('Post', postSchema);
