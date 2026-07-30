const mongoose = require("mongoose")

const voterSchema = new mongoose.Schema({

  // Voter Identity

  voterId: {
    type: String,
    required: true,
    unique: true,
  },

  aadhaarNumber: {
    type: String,
    required: true,
    unique: true,
  },

  aadhaarLinked: {
    type: Boolean,
    default: true,
  },

  // Personal Details

  fullName: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
    required: true,
  },

  gender: {
    type: String,
  },

  mobileNumber: {
    type: String,
    required: true,
  },

  email: {
    type: String,
  },

  address: {
    type: String,
  },

  constituency: {
    type: String,
    required: true,
  },

  state: {
    type: String,
  },

  // Verification Status

  faceVerified: {
    type: Boolean,
    default: false,
  },

  fingerprintVerified: {
    type: Boolean,
    default: false,
  },

  otpVerified: {
    type: Boolean,
    default: false,
  },

  otpCode: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },

  // Geolocation Survey & Verification
  assignedLatitude: {
    type: Number,
    default: null,
  },

  assignedLongitude: {
    type: Number,
    default: null,
  },

  assignedPollingStation: {
    type: String,
    default: "Registered Dataset Location",
  },

  allowedRadiusMeters: {
    type: Number,
    default: 1000,
  },

  geoVerified: {
    type: Boolean,
    default: false,
  },



  // Eligibility Status

  voterStatus: {
    type: String,
    enum: ["ACTIVE", "REMOVED", "EXPIRED", "BLOCKED"],
    default: "ACTIVE",
  },

  // Security Tracking

  fraudFlag: {
    type: Boolean,
    default: false,
  },

  fraudReason: {
    type: String,
  },

  // Blockchain Record

  blockchainHash: {
    type: String,
  },

  // Audit Tracking

  lastLogin: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Voting Status

  hasVoted: {
    type: Boolean,
    default: false,
  },

  votedAt: {
    type: Date,
  },
  faceImageIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],

  faceRegistered: {
    type: Boolean,
    default: false,
  },

})

module.exports = mongoose.model("Voter", voterSchema)