const express = require("express");
const router = express.Router();

const { BlogPosts } = require("./models");

// Add a blog post to BlogPosts
// New post needs: Title, content, author, (option) publication date
BlogPosts.create(
  "Title placeholder1",
  "Content placeholder1",
  "Author placeholder1"
);
BlogPosts.create(
  "Title placeholder2",
  "Content placeholder2",
  "Author placeholder2"
);
// GET
router.get("/", (req, res) => {
  res.json(BlogPosts.get());
});

// POST
router.post("/", (req, res) => {
  // Validate fields
  const requiredFields = ["title", "content", "author"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i]
    // Missing field
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body.`
      console.log(message);
      return res.status(400).send(message);
    }
  }
  // Valid: create post
  const item = BlogPosts.create(
    req.body.title,
    req.body.content,
    req.body.author
  )
  res.status(201).json(item)
});

// PUT
router.put("/:id", (req, res) => {
  // Validate fields
  const requiredFields = ["title", "content", "author", "publishDate", "id"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    // Missing field
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  // If invalid
  if (req.params.id !== req.body.id) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id} must match`;
    console.error(message)
    return res.status(400).send(message);
  }

  // Update blog post
  console.log(`Updating blog post \`${req.params.id}\``);
  BlogPosts.update({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    publishDate: req.body.publishDate,
    id: req.params.id
  });
  res.status(204).end();
});

// DELETE
router.delete("/:id", (req, res) => {
  BlogPosts.delete(req.params.id);
  console.log(`Deleted blog post \`${req.params.id}\``);
  res.status(204).end();
});

module.exports = router;