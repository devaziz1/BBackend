const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

const createBlog = async (req, res) => {
  try {
    const { userId, title, content, category } = req.body;

    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newBlog = new Blog({
      user: userId,
      title,
      content,
      category,
    });

    await newBlog.save();

    res.status(201).json(newBlog);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { title, content, category, blogId } = req.body;
    console.log("Inside update blog");
    console.log(title, content, category, blogId);
    if (!blogId) {
      return res.status(400).json({ message: "Blog ID is required" });
    }

    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (category) updates.category = category;

    updates.updatedAt = Date.now();

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updates, {
      new: true,
    });

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ hide: false })
      .populate("user", "name email")
      .populate("comments.user", "name email")
      .exec();

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const getBlogsByUser = async (req, res) => {
//   try {
//     const blogs = await Blog.find({ user: req.params.id, hide: false })
//       .populate("user", "name email")
//       .populate("comments.user", "name email")
//       .exec();

//     if (!blogs.length) {
//       return res.status(404).json({ message: "No blogs found for this user" });
//     }
//     console.log("All blogs fetched successfully");
//     res.status(200).json(blogs);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const searchBlogsByTitle = async (req, res) => {
  try {
    const { title } = req.params;
    console.log("title enter by user");
    console.log(title);

    if (!title) {
      return res
        .status(400)
        .json({ message: "Title query parameter is required" });
    }

    const titleRegex = new RegExp(title, "i");

    const blogs = await Blog.find({ title: titleRegex, hide: false })
      .populate("user", "name email")
      .populate("comments.user", "name email")
      .exec();

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchBlogsByTitleDashboard = async (req, res) => {
  try {
    const { title } = req.params;
    const { id } = req.query;

    console.log("Title entered by user:", title);
    console.log("User ID:", id);

    if (!title) {
      return res
        .status(400)
        .json({ message: "Title query parameter is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const titleRegex = new RegExp(title, "i");
    const blogs = await Blog.find({ user: id, title: titleRegex, hide: false })
      .populate("user", "name email")
      .populate("comments.user", "name email")
      .exec();

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error searching blogs:", error);
    res.status(500).json({ message: error.message });
  }
};

const searchBlogsByCategoryForUser = async (req, res) => {
  try {
    const { category, userId } = req.query;

    console.log("Category:", category);
    console.log("id:" + userId);

    if (
      !["Technology", "Sports", "Business", "Health", "Entertainment"].includes(
        category
      )
    ) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find blogs matching the category for the given user
    const blogs = await Blog.find({ user: userId, category, hide: false });

    if (blogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No blogs found for this user in this category" });
    }

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error searching blogs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const searchBlogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (
      !["Technology", "Sports", "Business", "Health", "Entertainment"].includes(
        category
      )
    ) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Find blogs matching the category
    const blogs = await Blog.find({ category, hide: false });

    if (blogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No blogs found in this category" });
    }

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const hideBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    blog.hide = true;
    await blog.save();
    res.status(200).json({ message: "Blog hidden successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unhideBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    blog.hide = false;
    await blog.save();
    res.status(200).json({ message: "Blog unhidden successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    console.log("inside backend Controller");
    console.log(blog);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    let userIdentifier = req.cookies.userIdentifier;

    if (!userIdentifier) {
      userIdentifier = generateUniqueIdentifier();
      res.cookie("userIdentifier", userIdentifier, {
        maxAge: 900000, // 15 minutes
        httpOnly: true,
      });
    }

    // Check if the user has already liked this blog
    if (blog.likes.includes(userIdentifier)) {
      return res
        .status(400)
        .json({ message: "You have already liked this blog." });
    }

    // Add the user identifier to the likes array
    blog.likes.push(userIdentifier);
    blog.likeCount++;
    await blog.save();

    res
      .status(200)
      .json({ message: "Blog liked successfully", likes: blog.likeCount });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

function generateUniqueIdentifier() {
  // Generate a unique identifier (e.g., using a random value or timestamp)
  return "unique-identifier-" + Date.now();
}

const UnlikeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    blog.likes--;
    await blog.save();
    res
      .status(200)
      .json({ message: "Blog un liked successfully", likes: blog.likes });
  } catch (error) {}
};

const addComment = async (req, res) => {
  try {
    const { blogId, content } = req.body;
    console.log("Comment API Hits");
    console.log(blogId, content);

    if (!blogId || !content) {
      return res
        .status(400)
        .json({ message: "blogId and content are required" });
    }

    const newComment = {
      content,
      createdAt: new Date(),
    };

    console.log("New comment");
    console.log(newComment);

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    blog.comments.push(newComment);
    blog.commentCount += 1;

    await blog.save();

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTotalCounts = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Blog.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$user",
          totalComments: { $sum: "$commentCount" },
          totalLikes: { $sum: "$likeCount" },
          totalPosts: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No blogs found for this user" });
    }

    const stats = result[0];

    res.json({
      userId: stats._id,
      totalComments: stats.totalComments,
      totalLikes: stats.totalLikes,
      totalPosts: stats.totalPosts,
    });
  } catch (error) {
    console.error("Error fetching user blog stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBlogsByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || "latest";
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    const totalBlogs = await Blog.countDocuments({ user: id });

   
    const skip = (page - 1) * limit;
    const sortOrder = sort === "latest" ? { createdAt: -1 } : { createdAt: 1 };

   
    const blogs = await Blog.find({ user: id })
      .sort(sortOrder)
      .populate("user", "name email")
      .populate("comments.user", "name email")
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json({
      user,
      blogs,
      totalBlogs,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / limit),
    });
  } catch (error) {
    console.error("Error fetching user and blogs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createBlog,
  deleteBlog,
  updateBlog,
  getAllBlogs,
  searchBlogsByTitleDashboard,
  getBlogsByUser,
  searchBlogsByTitle,
  hideBlog,
  unhideBlog,
  searchBlogsByCategoryForUser,
  likeBlog,
  addComment,
  UnlikeBlog,
  searchBlogsByCategory,
  getTotalCounts,
};
