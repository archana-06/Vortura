const mongoose = require("mongoose")

const voteSchema = new mongoose.Schema({

  voterId: {
    type: String,
    required: true,
  },

  candidateName: {
    type: String,
    required: true,
  },

  party: {
    type: String,
    required: true,
  },

  constituency: {
    type: String,
    required: true,
  },

  blockchainHash: {
    type: String,
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },

})

module.exports = mongoose.model("Vote", voteSchema)