const express = require('express');
const morgan = require('morgan');

// Express router, modularize to /blog-posts
const app = express();

const { BlogPosts } = require('./models');

// Log using HTTP layer
app.use(morgan('common')); 

app.use(express.json());

// Add a blog post to BlogPosts
// New post needs: Title, content, author, (option) publication date
BlogPosts.create(
  'Title placeholder',
  'Content placeholder',
  'Author placeholder'
)

// GET
app.get('/blog-posts', (req, res) => {
  res.json(BlogPosts.get());
});

// POST
app.post('/blog-posts', (req, res) => {
  // Validate fields
  const requiredFields = ['title', 'content', 'author'];
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
app.put('/blog-posts/:id', (req, res) => {
  // Validate fields
  const requiredFields = ['title', 'content', 'author', 'publishDate', 'id'];
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
app.delete('/blog-posts/:id', (req, res) => {
  BlogPosts.delete(req.params.id);
  console.log(`Deleted blog post \`${req.params.id}\``);
  res.status(204).end();
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});