const mongoose = require('mongoose');

const socialUserSchema = new mongoose.Schema({
  githubID: {
    required: false,
    type: String,
  },
  twitterID: {
    required: false,
    type: String,
  },
  username: {
    required: true,
    type: String,
  },
  displayName: {
    required: false,
    type: String,
  },
  photos: {
    required: false,
    type: String,
  },
});

module.exports = mongoose.model('socialUser', socialUserSchema);
