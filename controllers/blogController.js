const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const uploadFile = async (file, uploadPath) => {
  const { createReadStream, filename, mimetype, encoding } = await file;
  const stream = createReadStream();
  const filePath = path.join(uploadPath, filename);

  return new Promise((resolve, reject) => {
    stream
      .on("error", (error) => {
        if (stream.truncated)
          // Delete the truncated file
          fs.unlinkSync(filePath);
        reject(error);
      })
      .pipe(fs.createWriteStream(filePath))
      .on("error", (error) => reject(error))
      .on("finish", () => resolve({ filePath, mimetype, encoding }));
  });
};

const createBlog = async (req, res) => {
  try {
    const { userId, title, content, category, username } = req.body;
    console.log("Request body");
    console.log(req.body);

    const file = req.file;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let filePath = "";
    if (file) {
      filePath = path.join("/uploads", file.filename); // Relative path for serving the file
    }

    const newBlog = new Blog({
      user: userId,
      username,
      title,
      content,
      category,
      image: filePath,
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

    const blogsWithImageUrls = blogs.map((blog) => ({
      ...blog._doc, // Spread the existing blog document
      image: blog.image
        ? `${req.protocol}://${req.get("host")}${blog.image}`
        : null, // Append the base URL to the image path
    }));

    res.status(200).json(blogsWithImageUrls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const searchBlogsByTitle = async (req, res) => {
  try {
    const { title } = req.params;

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
    blog.likeCount++;
    await blog.save();

    res
      .status(200)
      .json({ message: "Blog liked successfully", likes: blog.likeCount });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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
    const { blogId, content, name } = req.body;
    console.log("Comment API Hits");
    console.log(blogId, content, name);

    if (!blogId || !content || !name) {
      return res
        .status(400)
        .json({ message: "blogId, content, and name are required" });
    }

    const newComment = {
      name,
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

const getUserBlogStats = async (req, res) => {
  const { userId } = req.params;

  try {
    const stats = await Blog.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: "$createdAt" },
          likeCount: 1,
          comments: 1,
        },
      },
      {
        $bucket: {
          groupBy: "$dayOfWeek",
          boundaries: [1, 2, 3, 4, 5, 6, 7, 8],
          default: "Other",
          output: {
            totalBlogs: { $sum: 1 },
            totalLikes: { $sum: "$likeCount" },
            totalComments: { $sum: { $size: "$comments" } },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const result = Array.from({ length: 7 }, (_, i) => {
      const stat = stats.find((s) => s._id === i + 1);
      return {
        day: dayNames[i],
        totalBlogs: stat ? stat.totalBlogs : 0,
        totalLikes: stat ? stat.totalLikes : 0,
        totalComments: stat ? stat.totalComments : 0,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting user daily stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserMonthlyStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const monthlyStats = await Blog.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              1
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          totalBlogs: { $sum: 1 },
          totalLikes: { $sum: "$likeCount" },
          totalComments: { $sum: "$commentCount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json(monthlyStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserYearlyStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const yearlyStats = await Blog.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1),
            $lt: new Date(new Date().getFullYear() + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y", date: "$createdAt" },
          },
          totalBlogs: { $sum: 1 },
          totalLikes: { $sum: "$likeCount" },
          totalComments: { $sum: "$commentCount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json(yearlyStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBlogById = async (req, res) => {
  const id = req.params.id;
  console.log(id);

  try {
    const blog = await Blog.findById(id)
      .populate("user", "name email") // Include only necessary fields
      .populate("comments.user", "name email");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Format the image URL
    const blogWithImageUrl = {
      ...blog._doc, // Spread the existing blog document
      image: blog.image
        ? `${req.protocol}://${req.get("host")}${blog.image.replace(
            /\\/g,
            "/"
          )}`
        : null,
    };

    res.status(200).json(blogWithImageUrl);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching blog", error: error.message });
  }
};


module.exports = {
  createBlog,
  getBlogById,
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
  getUserBlogStats,
  getUserMonthlyStats,
  getUserYearlyStats,
};
