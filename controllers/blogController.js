const Blog = require("../models/blogModel");
const User = require("../models/userModel");

const createBlog = async (req, res) => {
  try {
    const { userId, title, content } = req.body;

    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newBlog = new Blog({
      user: userId,
      title,
      content,
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
    const { title, content, blogId } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { title, content, updatedAt: Date.now() },
      { new: true }
    );

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
    const blogs = await Blog.find()
      .populate("user", "name email")
      .populate("comments.user", "name email")
      .exec();

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBlogsByUser = async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.params.id, hide: false })
      .populate("user", "name email")
      .populate("comments.user", "name email")
      .exec();

    if (!blogs.length) {
      return res.status(404).json({ message: "No blogs found for this user" });
    }
    console.log("All blogs fetched successfully");
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchBlogsByTitle = async (req, res) => {
  try {
    const { title } = req.body;
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
}

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
}

const likeBlog = async (req,res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        blog.likes++;
        await blog.save();
        res.status(200).json({ message: "Blog liked successfully", likes: blog.likes });
        
    } catch (error) {
        
    }
}

const addComment = async (req, res) => {
  try {
    const { blogId, content } = req.body;


    if (!blogId || !content) {
      return res
        .status(400)
        .json({ message: "blogId and content are required" });
    }



    const newComment = {
      content,
      createdAt: new Date(),
    };


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



module.exports = {
  createBlog,
  deleteBlog,
  updateBlog,
  getAllBlogs,
  getBlogsByUser,
  searchBlogsByTitle,
  hideBlog,
  unhideBlog,
  likeBlog,
  addComment,
};
