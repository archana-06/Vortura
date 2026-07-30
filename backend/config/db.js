const mongoose = require("mongoose")

const seedInitialData = async () => {
  try {
    const Voter = require("../models/Voter")
    const Election = require("../models/Election")
    const Candidate = require("../models/Candidate")

    const initialCandidates = [
      {
        name: "Vijay",
        party: "TVK",
        constituency: "chennai",
        symbol: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Indian_Election_Symbol_Whistle.svg/1200px-Indian_Election_Symbol_Whistle.svg.png",
        photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Actor_Vijay.jpg/640px-Actor_Vijay.jpg",
        status: "ACTIVE"
      },
      {
        name: "Stalin",
        party: "DMK",
        constituency: "trichy",
        symbol: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Indian_election_symbol_rising_sun.svg/3840px-Indian_election_symbol_rising_sun.svg.png",
        photo: "https://upload.wikimedia.org/wikipedia/commons/e/ea/M_K_Stalin_in_2021.jpg",
        status: "ACTIVE"
      },
      {
        name: "Seeman",
        party: "NTK",
        constituency: "madurai",
        symbol: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Indian_Election_Symbol_Farmer_with_Sugarcane.svg/1200px-Indian_Election_Symbol_Farmer_with_Sugarcane.svg.png",
        photo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Seeman_in_2021.jpg",
        status: "ACTIVE"
      }
    ]

    await Candidate.deleteMany({}).catch(() => null)

    for (const cData of initialCandidates) {
      await Candidate.create(cData)
      console.log(`Pre-seeded candidate: ${cData.name} (${cData.party})`)
    }

    let election = await Election.findOne()
    if (!election) {
      await Election.create({
        electionName: "Tamil Nadu Assembly Election 2026",
        startTime: "08:00",
        endTime: "18:00",
        isActive: false,
        statusText: "INACTIVE",
        resultsPublished: false
      })
      console.log("Seeded initial election document")
    }

    // Pre-seed Official Election Commission Voter Records with Biometric Profiles
    const initialVoters = [
      {
        voterId: "TN2026001",
        aadhaarNumber: "123456789012",
        fullName: "Archana S",
        age: 25,
        gender: "Female",
        mobileNumber: "9876543210",
        constituency: "Chennai South",
        voterStatus: "ACTIVE",
        faceRegistered: true,
        hasVoted: false
      },
      {
        voterId: "TN2026002",
        aadhaarNumber: "987654321098",
        fullName: "Rajesh Kumar",
        age: 32,
        gender: "Male",
        mobileNumber: "9876543211",
        constituency: "Chennai North",
        voterStatus: "ACTIVE",
        faceRegistered: true,
        hasVoted: false
      },
      {
        voterId: "TN2026003",
        aadhaarNumber: "456789123045",
        fullName: "Priya Dharshini",
        age: 28,
        gender: "Female",
        mobileNumber: "9876543212",
        constituency: "Madurai Urban",
        voterStatus: "ACTIVE",
        faceRegistered: true,
        hasVoted: false
      },
      {
        voterId: "ABC123456",
        aadhaarNumber: "888877776666",
        fullName: "Vijayakanth R",
        age: 29,
        gender: "Male",
        mobileNumber: "9876543213",
        constituency: "Perambur",
        voterStatus: "ACTIVE",
        faceRegistered: true,
        hasVoted: false
      },
      {
        voterId: "XYZ987654",
        aadhaarNumber: "999900001111",
        fullName: "Divya Bharathi",
        age: 27,
        gender: "Female",
        mobileNumber: "9876543214",
        constituency: "Tambaram",
        voterStatus: "ACTIVE",
        faceRegistered: true,
        hasVoted: false
      }
    ]

    for (const voterData of initialVoters) {
      let existingVoter = await Voter.findOne({ voterId: voterData.voterId })
      if (!existingVoter) {
        await Voter.create(voterData)
        console.log(`Pre-seeded official voter record: ${voterData.voterId} (${voterData.fullName})`)
      }
    }

    const AuditLog = require("../models/AuditLog")
    const Vote = require("../models/Vote")

    await AuditLog.deleteMany({})
    await Vote.deleteMany({})
    await Voter.updateMany({}, {
      hasVoted: false,
      otpVerified: false,
      faceVerified: false,
      fingerprintVerified: false,
      fraudFlag: false,
      fraudReason: null,
      allowedRadiusMeters: 1000
    })
    console.log("✅ Reset voter statuses, cleared old audit logs and votes for fresh election session")
  } catch (err) {
    console.error("Error seeding initial data:", err.message)
  }
}

const connectDB = async () => {
  try {
    mongoose.set("bufferCommands", false)
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    })

    console.log("✅ MongoDB Connected to Atlas successfully!")
    console.log("Database =", mongoose.connection.name)

    await seedInitialData()
  } catch (error) {
    console.warn("⚠️ MongoDB Atlas connection warning:", error.message)
    console.warn("⚠️ Please whitelist your current IP address (0.0.0.0/0) in MongoDB Atlas Network Access settings.")
  }
}

module.exports = connectDB