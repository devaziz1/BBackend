const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

router.post("/createBlog", blogController.createBlog);
router.delete("/:id", blogController.deleteBlog);
router.patch("/:id", blogController.updateBlog);
router.get("/getAllBlogs",blogController.getAllBlogs);
router.get("/getBlogsByUserId/:id", blogController.getBlogsByUser);
router.get("/searchByTitle", blogController.searchBlogsByTitle);
router.patch("/hideblog/:id", blogController.hideBlog);
router.patch("/unHideblog/:id", blogController.unhideBlog);
router.post("/addComment", blogController.addComment);






module.exports = router;
