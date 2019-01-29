const express = require('express');
const morgan = require('morgan');

const blogPostsRouter = require("./blogPostRouter");
const app = express();

const { BlogPosts } = require('./models');

app.use(morgan('common')); 
app.use(express.json());

app.use("/blog-posts", blogPostsRouter);

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});