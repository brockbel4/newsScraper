// This will throw a mongo duplicate error, it is intended functionality to prevent duplicate article data in the db

var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");

var db = require("./models");

var PORT = 8080;

var app = express();

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/scrapedNewsDB");

app.get("/articles", function (req, res) {

    axios.get("http://www.bbc.com/news/world/us_and_canada").then(function (response) {
        var $ = cheerio.load(response.data);
        var firstArticle = {};
        var secondArticle = {};
        var thirdArticle = {};

        firstArticle.title = $(".buzzard .title-link").text();
        firstArticle.description = $(".buzzard .buzzard__summary").text();
        firstArticle.link = "https://www.bbc.com" + $(".buzzard .title-link").attr("href");

        firstArticle = new db.Article(firstArticle).save();

        secondArticle.title = $("div[data-entityid='top_stories#2'] .title-link").text();
        secondArticle.description = $("div[data-entityid='top_stories#2'] .pigeon-item__summary").text();
        secondArticle.link = "https://www.bbc.com" + $("div[data-entityid='top_stories#2'] .title-link").attr("href");

        secondArticle = new db.Article(secondArticle).save();

        thirdArticle.title = $("div[data-entityid='top_stories#3'] .title-link").text();
        thirdArticle.description = $("div[data-entityid='top_stories#3'] .pigeon-item__summary").text();
        thirdArticle.link = "https://www.bbc.com" + $("div[data-entityid='top_stories#3'] .title-link").attr("href");

        thirdArticle = new db.Article(thirdArticle).save();

        db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });

    });

});

app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
       .then(function(dbArticle) {
           res.json(dbArticle);
       })
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    
    db.Article.findOne({_id: req.params.id})
    .then(function(dbArticle) {
        dbArticle.notes.push(req.body);
        dbArticle.save().then(function(dbArticle2) {
            res.json(dbArticle2)
        })
    })
});

app.get("/delete/:id/:note", function (req, res) {
    db.Article.findOne({_id: req.params.id})
    .then(function(dbArticle) {
        dbArticle.notes.splice(req.params.note, 1);
        dbArticle.save().then(function(dbArticle2) {
            res.redirect("/");
        })
    })
})

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
