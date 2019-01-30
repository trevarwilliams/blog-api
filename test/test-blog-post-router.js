const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Blog Posts", function () {

  before(function () {
    return runServer();
  });

  after(function () {
    return closeServer();
  });

  // GET
  it("Should return blog posts on GET", function () {
    return chai
      .request(app)
      .get("/blog-posts")
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a("array");
        expect(res.body.length).to.be.at.least(0);
        const expectedKeys = ["id", "title", "content", "author"]
        res.body.forEach(function (item) {
          expect(item).to.be.a("object");
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  // POST
  it("Should add a blog post on POST", function () {
    const newPost = {
      title: "new post title",
      content: "new post content",
      author: "new post author"
    };
    return chai
      .request(app)
      .post("/blog-posts")
      .send(newPost)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a("object");
        expect(res.body).to.include.keys("id", "title", "content", "author", "publishDate");
      });
  });

  // PUT
  it("Should update a blog post on PUT", function () {
    const newDate = Date.now();
    const updatePost = {
      title: "update title",
      content: "update content",
      author: "update author",
      publishDate: newDate
    };

    return (chai
      .request(app)
      .get("/blog-posts")
      .then(function (res) {
        updatePost.id = res.body[0].id;
        console.log("updatePost", updatePost);
        return chai
          .request(app)
          .put(`/blog-posts/${updatePost.id}`)
          .send(updatePost);
      })
      .then(function (res) {
        expect(res).to.have.status(204);
      })
    );
  });

  // DELETE
  it("Should remove blog post on DELETE", function () {
    return (
      chai
        .request(app)
        .get("/blog-posts")
        .then(function (res) {
          return chai.request(app).delete(`/blog-posts/${res.body[0].id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
        })
    );
  });
});