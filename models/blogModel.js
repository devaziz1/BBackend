const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const blogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  commentCount: { type: Number, default: 0 },
  likeCount: {
    type: Number,
    default: 0,
  },
  hide:{
    type: Boolean,
    default: false,
  },
  comments: [commentSchema],

},{
    timestamps: true,
  
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
