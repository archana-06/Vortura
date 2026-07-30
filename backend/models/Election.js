const mongoose = require("mongoose")

const electionSchema = new mongoose.Schema({

  electionName: {
    type: String,
    required: true,
  },

startTime: {
  type: String,
  default: "00:00:00"
},

endTime: {
  type: String,
  default: "00:00:00"
},
  isActive: {
    type: Boolean,
    default: false,
  },

  statusText: {
    type: String,
    default: "INACTIVE",
  },

  resultsPublished: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

})

module.exports = mongoose.model("Election", electionSchema)