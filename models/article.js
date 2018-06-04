var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({

  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true,
    unique: true
  },

  description: {
      type: String, 
      required: true
  },

  notes: [{
    author: String,
    content: String
  }]

});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
