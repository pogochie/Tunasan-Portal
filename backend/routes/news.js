const express = require("express");
const router = express.Router();
const News = require("../models/News");

router.post("/", async (req, res) => {
  const news = new News(req.body);
  await news.save();
  res.json({ message: "News published" });
});

router.get("/", async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 });
  res.json(news);
});

module.exports = router;
