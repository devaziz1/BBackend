const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const blogController = require("../controllers/blogController");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });


router.post("/createBlog", upload.single("image"), blogController.createBlog);
router.post("/addComment", blogController.addComment);

router.delete("/:id", blogController.deleteBlog);
router.patch("/", blogController.updateBlog);

router.get("/getAllBlogs", blogController.getAllBlogs);
router.get("/getBlogById/:id", blogController.getBlogById);

router.get("/getBlogsByUserId/:id", blogController.getBlogsByUser);
router.get("/searchByTitle/:title", blogController.searchBlogsByTitle);
router.get("/search/:title", blogController.searchBlogsByTitle);
router.get("/searchByCategory/:category", blogController.searchBlogsByCategory);
router.get("/searchByCategoryForUser",blogController.searchBlogsByCategoryForUser);
router.get("/getTotalCounts/:id", blogController.getTotalCounts);
router.get("/DailyBlogsStats/:userId", blogController.getUserBlogStats);
router.get("/MonthlyBlogsStats/:userId", blogController.getUserMonthlyStats);
router.get("/YearlyBlogsStats/:userId", blogController.getUserYearlyStats);


router.patch("/hideblog/:id", blogController.hideBlog);
router.patch("/unHideblog/:id", blogController.unhideBlog);
router.patch("/like/:id", blogController.likeBlog);
router.patch("/unLike/:id", blogController.UnlikeBlog);

module.exports = router;
