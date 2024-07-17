const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

router.post("/createBlog", blogController.createBlog);
router.post("/addComment", blogController.addComment);

router.delete("/:id", blogController.deleteBlog);
router.patch("/", blogController.updateBlog);

router.get("/getAllBlogs", blogController.getAllBlogs);
router.get("/getBlogsByUserId/:id", blogController.getBlogsByUser);
router.get("/searchByTitle/:title", blogController.searchBlogsByTitle);
router.get("/search/:title", blogController.searchBlogsByTitle);
router.get("/searchByCategory/:category", blogController.searchBlogsByCategory);
router.get("/searchByCategoryForUser",blogController.searchBlogsByCategoryForUser);
router.get("/getTotalCounts/:id", blogController.getTotalCounts);
router.get("/userBlogsStats/:userId", blogController.getUserBlogStats);

router.patch("/hideblog/:id", blogController.hideBlog);
router.patch("/unHideblog/:id", blogController.unhideBlog);
router.patch("/like/:id", blogController.likeBlog);
router.patch("/unLike/:id", blogController.UnlikeBlog);

module.exports = router;
