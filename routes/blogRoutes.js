const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

router.post("/createBlog", blogController.createBlog);
router.delete("/:id", blogController.deleteBlog);
router.patch("/", blogController.updateBlog);
router.get("/getAllBlogs", blogController.getAllBlogs);
router.get("/getBlogsByUserId/:id", blogController.getBlogsByUser);
router.get("/searchByTitle/:title", blogController.searchBlogsByTitle);
router.get("/search/:title", blogController.searchBlogsByTitle);

router.get("/getTotalCounts/:id", blogController.getTotalCounts);
router.get("/searchByCategory/:category", blogController.searchBlogsByCategory);
router.get("/searchByCategoryForUser", blogController.searchBlogsByCategoryForUser);

router.patch("/hideblog/:id", blogController.hideBlog);
router.patch("/unHideblog/:id", blogController.unhideBlog);
router.patch("/like/:id", blogController.likeBlog);
router.patch("/unLike/:id", blogController.UnlikeBlog);
router.post("/addComment", blogController.addComment);


module.exports = router;
