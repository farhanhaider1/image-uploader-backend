const Joi = require("joi");
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  dateAdded: {
    type: Date,
  },
});

const Post = mongoose.model("Posts", postSchema);

function validatePosts(post) {
  const schema = {
    key: Joi.string().min(1).required(),
    dateAdded: Joi.date(),
  };
  return Joi.validate(post, schema);
}

exports.Post = Post;
exports.validate = validatePosts;
