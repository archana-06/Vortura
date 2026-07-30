const mongoose = require("mongoose")

const candidateSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  party: {
    type: String,
    required: true
  },

  constituency: {
    type: String,
    required: true
  },

  photo: String,

  symbol: String,

  status: {
    type: String,
    default: "ACTIVE"
  }

})

module.exports = mongoose.model(
  "Candidate",
  candidateSchema
)