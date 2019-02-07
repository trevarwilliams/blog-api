'use strict';

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require("./config");
const { BlogPost, Author } = require('./models');

const app = express();

app.use(morgan("common")); 
app.use(express.json());

// GET
app.get('/posts', (req, res) => {
  BlogPost.find()
    .then(posts => {
      res.json(posts.map(post => post.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.get('/authors', (req, res) => {
  Author
    .find()
    .then(author => {
      res.json(author.map(author => {
        return {
          id: author._id,
          name: `${author.firstName} ${author.lastName}`,
          userName: author.userName
        };
      }));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    })
});

// GET by id
app.get('/posts/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .then(post => res.json(post.serialize))
  .catch(err => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  });
});

app.get('/authors/:id', (req, res) => {
  Author
    .findById(req.params.id)
    .then(author => {
      res.json({
        id: author.id,
        name: `${author.firstName} ${author.lastName}`,
        username: author.userName
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    })
})

// POST
app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author_id'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Author
    .findById(req.body.author_id)
    .then(author => {
      if (author) {
        BlogPost
          .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.id
          })
          .then(blogPost => res.status(201).json({
            id: blogPost.id,
            title: blogPost.title,
            author: `${author.firstName} ${author.lastName}`,
            content: blogPost.content,
            comments: blogPost.comments
          }))
          .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
          })
      }
      else {
        const message = 'Author does not exist';
        console.error(message);
        res.status(400).send(message)
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// PUT
app.put('/posts/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }
  
  const toUpdate = {};
  const updateableFields = ['title', 'content'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      update[field] = req.body[field];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id, { $set: updated })
    .then(blogPost => res.status(200).json({
      id: blogPost.id,
      title: blogPost.title,
      content: blogPost.content
    }))
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

// DELETE
app.delete('/posts/:id', (req, res) => {
  BlogPost.findByIdAndRemove(req.params.id)
    .then(BlogPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

// POST /authors
app.post('/authors', (req, res) => {
  const requiredFields = ['firstName', 'lastName', 'userName'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  };
Author
  .create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName
  })
  .then(author => {
    res.status(201).json({
      _id: author.id,
      name: `${author.firstName} ${author.lastName}`,
      userName: author.userName
    })
  })
  .catch(err => res.status(500).json({ message: 'Internal server error' }));
    // firstName, lastName, userName (and userName doesn't exist already)
    // if invalid status(400) + console.err(message)
})
//PUT /authors
  // req.body
    // firstName
    // lastName
    // userName
  // _id MUST be present
  // if authors/(:id) =/= req.body.authors.id -> status(400) + error message
  // if userName already taken -> status(400) + error message
  // return status(200) + updated:
    // _id
    // name: firstName + lastName
    // userName

// DELETE /authors/:id
  // delete author via _id
  // delete any blog posts by that author
  // status(204) + no content


// Non-existent endpoint
app.use('*', function (req, res) {
  res.status(404).json({ message: 'Not Found' });
});

let server;

function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }

      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on("error", err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
};

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
};

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = { app, runServer, closeServer };