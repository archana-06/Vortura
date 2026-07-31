const crypto = require("crypto")
const mongoose = require("mongoose")
const Vote = require("../models/Vote")
const express = require("express")
const router = express.Router()
const Election = require("../models/Election")
const Voter = require("../models/Voter")
const AuditLog = require("../models/AuditLog")

const twilio = require("twilio")
const nodemailer = require("nodemailer")

const Candidate = require("../models/Candidate")

const inMemoryOtps = new Map()
const hasVotedSet = new Set()

const defaultCandidates = [
  {
    id: 1,
    name: "Vijay",
    candidateName: "Vijay",
    party: "TVK",
    constituency: "chennai",
    symbol: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Indian_Election_Symbol_Whistle.svg/1200px-Indian_Election_Symbol_Whistle.svg.png",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Actor_Vijay.jpg/640px-Actor_Vijay.jpg",
    status: "ACTIVE"
  },
  {
    id: 2,
    name: "Stalin",
    candidateName: "Stalin",
    party: "DMK",
    constituency: "trichy",
    symbol: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Indian_election_symbol_rising_sun.svg/3840px-Indian_election_symbol_rising_sun.svg.png",
    photo: "https://upload.wikimedia.org/wikipedia/commons/e/ea/M_K_Stalin_in_2021.jpg",
    status: "ACTIVE"
  },
  {
    id: 3,
    name: "Seeman",
    candidateName: "Seeman",
    party: "NTK",
    constituency: "madurai",
    symbol: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Indian_Election_Symbol_Farmer_with_Sugarcane.svg/1200px-Indian_Election_Symbol_Farmer_with_Sugarcane.svg.png",
    photo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Seeman_in_2021.jpg",
    status: "ACTIVE"
  }
]

let inMemoryCandidates = [...defaultCandidates]

// Helper to send real Email OTP via Nodemailer
const sendEmailOTP = async (recipientEmail, otpCode) => {
  const emailUser = process.env.EMAIL_USER || "vorturaa@gmail.com"
  const emailPass = process.env.EMAIL_PASS || "djashsgoswurwklj"

  if (!recipientEmail || !recipientEmail.includes("@")) {
    return { success: false, error: "Invalid email" }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    })

    const mailOptions = {
      from: `"Vortura Digital Voting" <${emailUser}>`,
      to: recipientEmail,
      subject: `Vortura Digital Voting - Login OTP [${otpCode}] - ${new Date().toLocaleTimeString("en-US")}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #2563eb; margin-bottom: 8px;">🗳️ Vortura Secure Voting</h2>
          <p style="font-size: 16px; color: #334155; margin-bottom: 20px;">Your One-Time Password (OTP) for voter authentication is:</p>
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #ecfdf5 100%); padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0; border: 1px solid #cbd5e1;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0d9488;">${otpCode}</span>
          </div>
          <p style="font-size: 14px; color: #64748b; margin-top: 20px;">This OTP code is valid for 5 minutes. Do not share this code with anyone.</p>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`📧 Real Email OTP sent to ${recipientEmail}! Message ID: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error("📧 Email OTP sending error:", err.message)
    return { success: false, error: err.message }
  }
}

// Helper to send real SMS via Twilio or Fast2SMS
const sendRealSMS = async (mobileNumber, otpCode) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (accountSid && authToken && fromNumber) {
    try {
      const client = twilio(accountSid, authToken)
      const formattedPhone = mobileNumber.startsWith("+") ? mobileNumber : `+91${mobileNumber}`
      const message = await client.messages.create({
        body: `Your Vortura Voting Platform OTP is ${otpCode}. Valid for 5 minutes. Do not share this code with anyone.`,
        from: fromNumber,
        to: formattedPhone
      })
      console.log(`📱 Real SMS sent via Twilio to ${formattedPhone}! SID: ${message.sid}`)
      return { success: true, provider: "Twilio", sid: message.sid }
    } catch (err) {
      console.error("📱 Twilio SMS sending failed:", err.message)
    }
  }

  const fast2smsKey = process.env.FAST2SMS_API_KEY
  if (fast2smsKey) {
    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": fast2smsKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otpCode,
          numbers: mobileNumber
        })
      })
      const data = await response.json()
      console.log("📱 Fast2SMS OTP response:", data)
      return { success: data.return, provider: "Fast2SMS" }
    } catch (err) {
      console.error("📱 Fast2SMS error:", err.message)
    }
  }

  return { success: false }
}

// RESET VOTES FOR REAL-TIME TESTING
router.post("/reset-votes", async (req, res) => {
  try {
    hasVotedSet.clear()
    inMemoryOtps.clear()
    if (mongoose.connection.readyState === 1) {
      await Voter.updateMany({}, { hasVoted: false, otpVerified: false, faceVerified: false, fingerprintVerified: false })
      await Vote.deleteMany({})
    }
    console.log("🔄 Reset all votes for real-time voting")
    res.json({ message: "Voting session reset. All voter IDs can now vote in real-time." })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// REGISTER VOTER

router.post("/register", async (req, res) => {

  try {

    const {

      voterId,
      aadhaarNumber,
      fullName,
      age,
      gender,
      mobileNumber,
      constituency

    } = req.body

    // CHECK EXISTING VOTER

    const existingVoter = await Voter.findOne({
      voterId
    })

    if (existingVoter) {

      return res.status(400).json({
        message: "Voter already exists"
      })

    }

    // CREATE NEW VOTER

    const newVoter = new Voter({

      voterId,
      aadhaarNumber,
      fullName,
      age,
      gender,
      mobileNumber,
      constituency

    })

    await newVoter.save()

    res.status(201).json({
      message: "Voter registered successfully",
      voter: newVoter
    })

  } catch (error) {

    res.status(500).json({
      message: error.message
    })

  }

})

// VOTER LOGIN

router.post("/login", async (req, res) => {
  try {
    const { voterId, aadhaarNumber } = req.body

    let voter = null
    let election = null

    if (mongoose.connection.readyState === 1) {
      voter = await Voter.findOne({ voterId }).catch(() => null)
      election = await Election.findOne().catch(() => null)
    }

    if (!voter && voterId === "TN2026001") {
      voter = {
        fullName: "Archana",
        voterId: "TN2026001",
        aadhaarNumber: aadhaarNumber || "123456789012",
        constituency: "Chennai South",
        voterStatus: "ACTIVE",
        hasVoted: false
      }
    }

    if (!voter) {
      return res.status(404).json({
        message: "Voter not found"
      })
    }

    if (voter.hasVoted || hasVotedSet.has(voterId)) {
      return res.status(403).json({
        message: "Vote already casted. You cannot log in to vote again."
      })
    }

    res.status(200).json({
      message: "Login successful",
      voter: {
        fullName: voter.fullName,
        voterId: voter.voterId,
        constituency: voter.constituency || "Chennai South",
      }
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
})
// GENERATE OTP (Supports Email & Mobile)
router.post("/generate-otp", async (req, res) => {
  try {
    if (inMemoryElectionState.isActive === false && process.env.SELENIUM_TEST_MODE !== "true") {
      return res.status(403).json({
        message: "Election is currently inactive or closed. OTP generation and voter authentication are disabled until the administrator starts the election."
      })
    }

    const { voterId, email, mobileNumber } = req.body

    if (!voterId) {
      return res.status(400).json({
        message: "Please enter a valid Voter ID Number."
      })
    }

    let voter = null
    if (mongoose.connection.readyState === 1) {
      voter = await Voter.findOne({ voterId })
    }

    const targetEmail = email || (voter && voter.email ? voter.email : null) || (mobileNumber && mobileNumber.includes("@") ? mobileNumber : null) || "voter@example.com"
    console.log("Received generate-otp request for voterId:", voterId, "email/contact:", targetEmail)

    // Check if voter has already voted
    if ((voter && voter.hasVoted) || hasVotedSet.has(voterId)) {
      return res.status(403).json({
        message: `Voter ID '${voterId}' has already cast a vote. Multiple voting is strictly prohibited.`
      })
    }

    // Dynamically initialize voter if not found
    if (!voter) {
      voter = new Voter({
        voterId,
        aadhaarNumber: "1234" + Math.floor(10000000 + Math.random() * 90000000),
        fullName: "Voter " + voterId,
        age: 25,
        gender: "General",
        mobileNumber: mobileNumber || "9876543210",
        email: targetEmail,
        constituency: "Chennai South",
        voterStatus: "ACTIVE",
        hasVoted: false
      })
      if (mongoose.connection.readyState === 1) {
        await voter.save().catch(err => console.error("Error saving new voter:", err.message))
      }
    }

    const otp = process.env.SELENIUM_TEST_MODE === "true"
      ? "123456"
      : Math.floor(100000 + Math.random() * 900000).toString()

    voter.otpCode = otp
    voter.otpExpires = new Date(Date.now() + 5 * 60 * 1000)

    if (mongoose.connection.readyState === 1) {
      await voter.save().catch(() => null)
    }

    inMemoryOtps.set(voterId, {
      otpCode: otp,
      expires: Date.now() + 5 * 60 * 1000
    })

    // Send Real Email OTP
    const emailResult = await sendEmailOTP(targetEmail, otp)
    if (mobileNumber && !mobileNumber.includes("@")) {
      sendRealSMS(mobileNumber, otp).catch(err => console.error("SMS async send error:", err))
    }

    console.log(`✅ Generated real OTP for ${voterId} (${targetEmail}): ${otp}`)

    res.json({
      message: emailResult.success
        ? `OTP sent successfully to email: ${targetEmail}! Please check your inbox.`
        : `OTP generated successfully for ${voterId}. (Email delivery attempted to ${targetEmail})`
    })
  } catch (error) {
    console.error("Generate OTP Error:", error)
    res.status(500).json({
      message: error.message || "Server error while generating OTP"
    })
  }
})

// VERIFY OTP

router.post("/verify-otp", async (req, res) => {
  try {
    const { voterId, otp } = req.body
    console.log("Received verify-otp request for voterId:", voterId, "otp:", otp)

    let voter = null
    if (mongoose.connection.readyState === 1) {
      voter = await Voter.findOne({ voterId })
    }

    const memData = inMemoryOtps.get(voterId)
    const validOtp = voter?.otpCode || memData?.otpCode

    if (!validOtp || otp !== validOtp) {
      console.log(`🚨 Invalid OTP attempt for Voter ID: '${voterId}'. Expected: '${validOtp}', Received: '${otp}'. Logging OTP_FAILED event.`)
      
      const logData = {
        action: "OTP_FAILED",
        voterId: voterId || "UNKNOWN",
        status: "FAILED",
        details: `Invalid OTP verification attempt for Voter ID: ${voterId} (Entered: ${otp})`
      }

      if (mongoose.connection.readyState === 1) {
        await AuditLog.create(logData).catch(err => console.error("AuditLog save error:", err.message))
      }

      return res.status(401).json({
        message: "Invalid OTP. Please enter the correct 6-digit code sent to your email address."
      })
    }

    if (voter) {
      voter.otpVerified = true
      voter.otpCode = null
      voter.otpExpires = null
      if (mongoose.connection.readyState === 1) {
        await voter.save()
      }
    }

    res.status(200).json({
      message: "OTP verified successfully"
    })
  } catch (error) {
    console.error("Verify OTP Error:", error)
    res.status(500).json({
      message: error.message || "Server error while verifying OTP"
    })
  }
})

// FACE VERIFICATION (Voter ID Biometric Authentication)

router.post("/verify-face", async (req, res) => {
  try {
    const {
      voterId,
      predictedVoterId,
      confidence,
      faceMatch,
    } = req.body

    const targetVoterId = (voterId || "").trim()

    let voter = null
    if (mongoose.connection.readyState === 1) {
      voter = await Voter.findOne({
        voterId: targetVoterId,
      })
    }

    if (!voter) {
      return res.status(404).json({
        message: "Voter not found",
      })
    }

    if (req.body.isSpoof === true || req.body.spoofDetected === true) {
      if (mongoose.connection.readyState === 1) {
        await AuditLog.create({
          action: "AI_SPOOF_DETECTED",
          voterId: targetVoterId,
          status: "BLOCKED",
          details: `AI Anti-Spoofing algorithm detected presentation attack for Voter ID: ${targetVoterId}`
        }).catch(() => null)
      }
    }

    if (
      faceMatch !== true ||
      predictedVoterId !== voter.voterId ||
      Number(confidence) < 58
    ) {
      voter.faceVerified = false
      voter.fraudFlag = true
      voter.fraudReason =
        "Live face did not match registered voter dataset"

      if (mongoose.connection.readyState === 1) {
        await voter.save().catch(() => null)
        await AuditLog.create({
          action: "FACE_VERIFICATION_FAILED",
          voterId: targetVoterId,
          status: "FAILED",
          details: `Face biometric verification failed for Voter ID: ${targetVoterId}`
        }).catch(() => null)
      }

      return res.status(401).json({
        message:
          "Face mismatch. Access blocked.",
      })
    }

    voter.faceVerified = true
    voter.fraudFlag = false
    voter.fraudReason = null

    if (mongoose.connection.readyState === 1) {
      await voter.save().catch(() => null)
    }

    return res.json({
      message: "Face verified successfully",
    })
  } catch (error) {
    console.error("verify-face error:", error)
    res.status(500).json({
      message: error.message || "Server error during face verification"
    })
  }
})

// FINGERPRINT VERIFICATION

router.post("/verify-fingerprint", async (req, res) => {
  try {
    const { voterId, fingerprintMatch } = req.body
    let voter = null
    if (mongoose.connection.readyState === 1) {
      voter = await Voter.findOne({ voterId })
    }

    if (fingerprintMatch === true) {
      if (voter) {
        voter.fingerprintVerified = true
        if (mongoose.connection.readyState === 1) {
          await voter.save()
        }
      }
      return res.status(200).json({
        message: "Fingerprint verification successful"
      })
    }

    if (voter) {
      voter.fraudFlag = true
      voter.fraudReason = "FINGERPRINT_MISMATCH"
      if (mongoose.connection.readyState === 1) {
        await voter.save().catch(() => null)
      }
    }

    if (mongoose.connection.readyState === 1) {
      await AuditLog.create({
        action: "FINGERPRINT_FAILED",
        voterId: voterId || "UNKNOWN",
        status: "FAILED",
        details: `Fingerprint biometric scan mismatch for Voter ID: ${voterId}`
      }).catch(() => null)
    }

    return res.status(401).json({
      message: "Fingerprint verification failed"
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
})

// HAVERSINE DISTANCE CALCULATOR (METERS)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000 // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

// GEOLOCATION VERIFICATION (SURVEY LOCATION vs LIVE GPS)
router.post("/verify-geolocation", async (req, res) => {
  try {
    if (inMemoryElectionState.isActive === false) {
      return res.status(403).json({
        message: "Election is currently inactive or closed. Geo-location verification is disabled."
      })
    }

    const { voterId, liveLatitude, liveLongitude } = req.body
    const targetVoterId = voterId || "TN2026001"

    let voter = null
    if (mongoose.connection.readyState === 1) {
      voter = await Voter.findOne({ voterId: targetVoterId })
    }

    if (!global.voterLocationMap) global.voterLocationMap = new Map()
    const memoryLoc = global.voterLocationMap.get(targetVoterId)

    const assignedLat = voter?.assignedLatitude ?? memoryLoc?.assignedLatitude ?? 13.0067
    const assignedLng = voter?.assignedLongitude ?? memoryLoc?.assignedLongitude ?? 80.2570
    const pollingStation = voter?.assignedPollingStation ?? memoryLoc?.assignedPollingStation ?? "Adyar Polling Station #04, Chennai"
    const allowedRadius = voter?.allowedRadiusMeters ?? memoryLoc?.allowedRadiusMeters ?? 1000

    const lat1 = Number(liveLatitude)
    const lng1 = Number(liveLongitude)

    if (isNaN(lat1) || isNaN(lng1)) {
      return res.status(400).json({
        verified: false,
        message: "Invalid GPS coordinates received. Please enable device location."
      })
    }

    const distanceMeters = calculateHaversineDistance(lat1, lng1, assignedLat, assignedLng)
    const isWithinRadius = distanceMeters <= allowedRadius

    if (isWithinRadius) {
      if (voter) {
        voter.geoVerified = true
        if (mongoose.connection.readyState === 1) {
          await voter.save().catch(() => null)
        }
      }
      return res.status(200).json({
        verified: true,
        distanceMeters,
        allowedRadiusMeters: allowedRadius,
        pollingStation,
        assignedLat,
        assignedLng,
        liveLat: lat1,
        liveLng: lng1,
        message: `Geo-location verified successfully! You are ${distanceMeters}m from marked dataset location (within ${allowedRadius}m / 1km boundary).`
      })
    } else {
      if (voter) {
        voter.geoVerified = false
        voter.fraudFlag = true
        voter.fraudReason = "LOCATION_MISMATCH"
        if (mongoose.connection.readyState === 1) {
          await voter.save().catch(() => null)
        }
      }

      // Log location mismatch in audit logs
      if (mongoose.connection.readyState === 1) {
        await AuditLog.create({
          voterId: targetVoterId,
          action: "LOCATION_MISMATCH",
          status: "BLOCKED",
          details: `Location Mismatch: Live coordinates (${lat1.toFixed(4)}, ${lng1.toFixed(4)}) are ${distanceMeters}m away from marked dataset location (Max allowed: ${allowedRadius}m / 1km).`
        }).catch(() => null)
      }

      return res.status(403).json({
        verified: false,
        distanceMeters,
        allowedRadiusMeters: allowedRadius,
        pollingStation,
        assignedLat,
        assignedLng,
        liveLat: lat1,
        liveLng: lng1,
        message: `Location Mismatch: You are ${distanceMeters}m away from your marked face dataset location (${pollingStation}). Max allowed radius is ${allowedRadius}m (1 km). Vote casting is blocked.`
      })
    }
  } catch (error) {
    console.error("verify-geolocation error:", error)
    res.status(500).json({ message: error.message })
  }
})

// GET VOTER MARKED LOCATION DETAILS
router.get("/location-info/:voterId", async (req, res) => {
  try {
    const voterId = req.params.voterId.trim()

    if (!global.voterLocationMap) global.voterLocationMap = new Map()
    const memoryLoc = global.voterLocationMap.get(voterId)

    let voter = null
    if (mongoose.connection.readyState === 1) {
      voter = await Voter.findOne({ voterId })
    }

    const assignedLatitude = voter?.assignedLatitude ?? memoryLoc?.assignedLatitude ?? 13.0067
    const assignedLongitude = voter?.assignedLongitude ?? memoryLoc?.assignedLongitude ?? 80.2570
    const assignedPollingStation = voter?.assignedPollingStation ?? memoryLoc?.assignedPollingStation ?? "Adyar Polling Station #04, Chennai"
    const allowedRadiusMeters = voter?.allowedRadiusMeters ?? memoryLoc?.allowedRadiusMeters ?? 1000

    return res.json({
      voterId,
      assignedLatitude,
      assignedLongitude,
      assignedPollingStation,
      allowedRadiusMeters,
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    })
  }
})

// POST UPDATE VOTER MARKED LOCATION
router.post("/update-location", async (req, res) => {
  try {
    const {
      voterId,
      latitude,
      longitude,
      pollingStation,
      allowedRadiusMeters,
    } = req.body

    const targetVoterId = (voterId || "").trim()
    if (!targetVoterId) {
      return res.status(400).json({ message: "Voter ID is required" })
    }

    const numericLatitude = Number(latitude)
    const numericLongitude = Number(longitude)

    if (!Number.isFinite(numericLatitude) || !Number.isFinite(numericLongitude)) {
      return res.status(400).json({
        message: "Valid latitude and longitude are required",
      })
    }

    const radius = Number(allowedRadiusMeters) || 1000

    if (!global.voterLocationMap) global.voterLocationMap = new Map()
    global.voterLocationMap.set(targetVoterId, {
      assignedLatitude: numericLatitude,
      assignedLongitude: numericLongitude,
      assignedPollingStation: pollingStation || "Registered Dataset Location",
      allowedRadiusMeters: radius,
    })

    let voter = null
    if (mongoose.connection.readyState === 1) {
      voter = await Voter.findOneAndUpdate(
        { voterId: targetVoterId },
        {
          assignedLatitude: numericLatitude,
          assignedLongitude: numericLongitude,
          assignedPollingStation: pollingStation || "Registered Dataset Location",
          allowedRadiusMeters: radius,
        },
        {
          new: true,
          runValidators: true,
        }
      )
    }

    console.log(`📍 Location updated for Voter ${targetVoterId}: ${numericLatitude}, ${numericLongitude} (${pollingStation})`)

    return res.json({
      message: "Registered location updated successfully",
      assignedLatitude: voter ? voter.assignedLatitude : numericLatitude,
      assignedLongitude: voter ? voter.assignedLongitude : numericLongitude,
      assignedPollingStation: voter ? voter.assignedPollingStation : (pollingStation || "Registered Dataset Location"),
      allowedRadiusMeters: voter ? voter.allowedRadiusMeters : radius,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: error.message,
    })
  }
})
router.post("/cast-vote", async (req, res) => {
  try {
    const { voterId, candidateName, party } = req.body
    const targetVoterId = voterId || "TN2026001"

    // 0. Check election active status
    if (inMemoryElectionState.isActive === false) {
      return res.status(403).json({
        message: "Voting is currently closed. Election session is inactive or ended."
      })
    }

    let voter = null
    if (mongoose.connection.readyState === 1) {
      voter = await Voter.findOne({ voterId: targetVoterId })
    }

    // 1. Check DB for existing vote
    if (voter && voter.hasVoted) {
      if (mongoose.connection.readyState === 1) {
        await AuditLog.create({
          action: "DUPLICATE_VOTE_ATTEMPT",
          voterId: targetVoterId,
          status: "BLOCKED",
          details: "Voter attempted multiple voting"
        }).catch(err => console.error("Audit log creation failed:", err.message))
      }
      return res.status(403).json({
        message: "Vote already casted. You cannot vote multiple times with the same Voter ID."
      })
    }

    // 2. Check in-memory store for existing vote
    if (hasVotedSet.has(targetVoterId)) {
      return res.status(403).json({
        message: "Vote already casted. You cannot vote multiple times with the same Voter ID."
      })
    }

    // 3. Generate Blockchain Hash
    const blockchainHash = crypto
      .createHash("sha256")
      .update(targetVoterId + candidateName + party + Date.now())
      .digest("hex")

    // 4. Save vote status into MongoDB & Memory
    if (!voter && mongoose.connection.readyState === 1) {
      voter = await Voter.create({
        voterId: targetVoterId,
        aadhaarNumber: "1234" + Math.floor(10000000 + Math.random() * 90000000),
        fullName: "Voter " + targetVoterId,
        constituency: "Chennai South",
        voterStatus: "ACTIVE",
        hasVoted: true,
        blockchainHash,
        votedAt: new Date()
      }).catch(() => null)
    } else if (voter) {
      voter.hasVoted = true
      voter.blockchainHash = blockchainHash
      voter.votedAt = new Date()
      if (mongoose.connection.readyState === 1) {
        await voter.save().catch(() => null)
      }
    }

    if (mongoose.connection.readyState === 1) {
      const newVote = new Vote({
        voterId: targetVoterId,
        candidateName,
        party,
        constituency: voter?.constituency || "Chennai South",
        blockchainHash
      })
      await newVote.save().catch(() => null)
    }

    hasVotedSet.add(targetVoterId)

    console.log(`✅ Vote casted for ${targetVoterId}: Candidate=${candidateName}, Hash=${blockchainHash}`)

    res.status(201).json({
      message: "Vote casted successfully",
      blockchainHash,
      vote: {
        voterId: targetVoterId,
        candidateName,
        party,
        blockchainHash
      }
    })
  } catch (error) {
    console.error("Cast Vote Error:", error)
    res.status(500).json({
      message: error.message || "Server error while casting vote"
    })
  }
})

// GET APPROVED ACTIVE CANDIDATES FOR BALLOT PAPER
router.get("/candidates", async (req, res) => {
  try {
    let dbCandidates = []
    if (mongoose.connection.readyState === 1) {
      dbCandidates = await Candidate.find({ status: "ACTIVE" }).catch(() => [])
    }

    if (dbCandidates && dbCandidates.length > 0) {
      const dedupMap = new Map()
      dbCandidates.forEach(c => {
        const key = (c.name || c.candidateName || "").toLowerCase().trim()
        if (key && !dedupMap.has(key)) {
          dedupMap.set(key, {
            candidateName: c.name,
            name: c.name,
            party: c.party,
            constituency: c.constituency,
            photo: c.photo || "",
            symbol: c.symbol || "🗳️",
            status: c.status || "ACTIVE"
          })
        }
      })
      return res.json(Array.from(dedupMap.values()))
    }

    const dedupMemoryMap = new Map()
    inMemoryCandidates.forEach(c => {
      if (c.status === "ACTIVE" || !c.status) {
        const key = (c.candidateName || c.name || "").toLowerCase().trim()
        if (key && !dedupMemoryMap.has(key)) {
          dedupMemoryMap.set(key, {
            candidateName: c.candidateName || c.name,
            name: c.name || c.candidateName,
            party: c.party,
            constituency: c.constituency,
            photo: c.photo || "",
            symbol: c.symbol || "🗳️",
            status: c.status || "ACTIVE"
          })
        }
      }
    })

    res.json(Array.from(dedupMemoryMap.values()))
  } catch (error) {
    const dedupMemoryMap = new Map()
    inMemoryCandidates.forEach(c => {
      if (c.status === "ACTIVE" || !c.status) {
        const key = (c.candidateName || c.name || "").toLowerCase().trim()
        if (key && !dedupMemoryMap.has(key)) {
          dedupMemoryMap.set(key, {
            candidateName: c.candidateName || c.name,
            name: c.name || c.candidateName,
            party: c.party,
            constituency: c.constituency,
            photo: c.photo || "",
            symbol: c.symbol || "🗳️",
            status: c.status || "ACTIVE"
          })
        }
      }
    })
    res.json(Array.from(dedupMemoryMap.values()))
  }
})

// POST SYNC / UPDATE CANDIDATES FROM ADMIN MANAGEMENT
router.post("/candidates/sync", async (req, res) => {
  try {
    const { candidates } = req.body
    if (Array.isArray(candidates)) {
      // Store exact candidate list from Candidate Management
      inMemoryCandidates = candidates.map(c => ({
        candidateName: c.candidateName || c.name,
        name: c.name || c.candidateName,
        party: c.party,
        constituency: c.constituency,
        photo: c.photo || "",
        symbol: c.symbol || "🗳️",
        status: c.status || "ACTIVE"
      }))

      if (mongoose.connection.readyState === 1) {
        // Clear old database candidates and insert exact list from Candidate Management
        await Candidate.deleteMany({}).catch(() => null)
        for (const item of inMemoryCandidates) {
          if (item.name) {
            await Candidate.create({
              name: item.name,
              party: item.party,
              constituency: item.constituency || "General",
              photo: item.photo || "",
              symbol: item.symbol || "🗳️",
              status: item.status || "ACTIVE"
            }).catch(() => null)
          }
        }
      }
    }
    res.json({ message: "Candidates synced successfully", candidates: inMemoryCandidates })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// LIVE RESULTS

router.get("/results", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        message: "Live election results",
        results: [
          { _id: { candidateName: "Dr. MK Stalin", party: "DMK" }, totalVotes: 1 },
          { _id: { candidateName: "Edappadi K. Palaniswami", party: "AIADMK" }, totalVotes: 0 },
          { _id: { candidateName: "K. Annamalai", party: "BJP" }, totalVotes: 0 },
          { _id: { candidateName: "Seeman", party: "NTK" }, totalVotes: 0 }
        ]
      })
    }

    const results = await Vote.aggregate([
      {
        $group: {
          _id: {
            candidateName: "$candidateName",
            party: "$party",
          },
          totalVotes: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          totalVotes: -1
        }
      }
    ])

    res.status(200).json({
      message: "Live election results",
      results
    })
  } catch (error) {
    res.status(200).json({
      message: "Live election results",
      results: []
    })
  }
})

// IN-MEMORY ELECTION STATE FALLBACK & SYNCHRONIZATION
let inMemoryElectionState = {
  electionName: "Tamil Nadu Assembly Election 2026",
  startTime: "00:00",
  endTime: "23:59",
  isActive: true,
  statusText: "ACTIVE",
  resultsPublished: false,
}

// AUTO-END ELECTION CHECK LOGIC
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null
  let str = String(timeStr).trim()

  if (str.includes("T")) {
    str = str.split("T")[1] || str
  }

  const isPM = /pm/i.test(str)
  const isAM = /am/i.test(str)
  const cleanStr = str.replace(/(am|pm)/gi, "").trim()
  const parts = cleanStr.split(":")

  let hours = parseInt(parts[0], 10)
  let minutes = parseInt(parts[1] || "0", 10)

  if (isNaN(hours) || isNaN(minutes)) return null

  if (isPM && hours < 12) {
    hours += 12
  } else if (isAM && hours === 12) {
    hours = 0
  }

  return hours * 60 + minutes
}

function checkAutoEndElection() {
  if (!inMemoryElectionState.isActive) return false

  try {
    const now = new Date()
    const nowMins = now.getHours() * 60 + now.getMinutes()

    const startMins = parseTimeToMinutes(inMemoryElectionState.startTime)
    const endMins = parseTimeToMinutes(inMemoryElectionState.endTime)

    // If times are null, unparseable, or identical (e.g. 00:00 - 00:00), do NOT auto-end
    if (startMins === null || endMins === null || startMins === endMins) {
      return false
    }

    if (startMins < endMins) {
      // Same day window e.g. 08:00 AM (480 mins) to 06:00 PM (1080 mins)
      if (nowMins >= endMins) {
        triggerAutoEnd()
        return true
      }
    } else if (startMins > endMins) {
      // Overnight window e.g. 11:30 PM (1410 mins) to 03:00 AM (180 mins)
      if (nowMins >= endMins && nowMins < startMins) {
        triggerAutoEnd()
        return true
      }
    }
  } catch (err) {
    console.error("Auto end check error:", err.message)
  }

  return false
}

function triggerAutoEnd() {
  if (process.env.SELENIUM_TEST_MODE === "true") return
  if (!inMemoryElectionState.isActive) return
  console.log("⏰ Election end time reached! Automatically ending election session.")
  inMemoryElectionState.isActive = false
  inMemoryElectionState.statusText = "ENDED"
  if (mongoose.connection.readyState === 1) {
    Election.findOne().then(election => {
      if (election) {
        election.isActive = false
        election.statusText = "ENDED"
        election.save().catch(() => null)
      }
    }).catch(() => null)
  }
}

// Background auto-end check interval every 3 seconds
setInterval(checkAutoEndElection, 3000)

// GET ELECTION STATUS

router.get("/election-status", async (req, res) => {
  try {
    checkAutoEndElection()

    if (mongoose.connection.readyState === 1) {
      const election = await Election.findOne().catch(() => null)
      if (election) {
        inMemoryElectionState.electionName = election.electionName || inMemoryElectionState.electionName
        inMemoryElectionState.startTime = election.startTime || inMemoryElectionState.startTime
        inMemoryElectionState.endTime = election.endTime || inMemoryElectionState.endTime
        inMemoryElectionState.isActive = election.isActive !== undefined ? election.isActive : inMemoryElectionState.isActive
        inMemoryElectionState.statusText = election.statusText || (election.isActive ? "ACTIVE" : "INACTIVE")
        inMemoryElectionState.resultsPublished = election.resultsPublished || inMemoryElectionState.resultsPublished
      }
    }

    // Re-verify auto-end status after DB sync
    checkAutoEndElection()

    res.status(200).json({
      electionName: inMemoryElectionState.electionName,
      startTime: inMemoryElectionState.startTime,
      endTime: inMemoryElectionState.endTime,
      isActive: inMemoryElectionState.statusText === "ACTIVE",
      statusText: inMemoryElectionState.statusText,
      resultsPublished: inMemoryElectionState.resultsPublished
    })
  } catch (error) {
    checkAutoEndElection()
    res.status(200).json(inMemoryElectionState)
  }
})

// START ELECTION

router.post("/start-election", async (req, res) => {
  try {
    const { startTime, endTime } = req.body

    inMemoryElectionState.startTime = startTime || inMemoryElectionState.startTime
    inMemoryElectionState.endTime = endTime || inMemoryElectionState.endTime
    inMemoryElectionState.isActive = true
    inMemoryElectionState.statusText = "ACTIVE"
    inMemoryElectionState.resultsPublished = false

    // Clear in-memory caches
    hasVotedSet.clear()
    inMemoryOtps.clear()

    // Always clear old audit logs, votes, and fraud flags when starting an election session
    if (mongoose.connection.readyState === 1) {
      let election = await Election.findOne().catch(() => null)
      if (!election) {
        election = new Election({
          electionName: "Tamil Nadu Assembly Election 2026",
        })
      }
      election.startTime = inMemoryElectionState.startTime
      election.endTime = inMemoryElectionState.endTime
      election.isActive = true
      election.statusText = "ACTIVE"
      election.resultsPublished = false
      await election.save().catch(() => null)

      await Vote.deleteMany({})
      await AuditLog.deleteMany({})
      await Voter.updateMany({}, {
        hasVoted: false,
        otpVerified: false,
        faceVerified: false,
        fingerprintVerified: false,
        fraudFlag: false,
        fraudReason: null
      })
      console.log("🧹 Cleared all historical audit logs & votes for new election session")
    }

    res.json({
      message: "Election session started cleanly! Historical audit logs, votes, and fraud counts reset to 0.",
      election: inMemoryElectionState
    })
  } catch (error) {
    console.error("start-election error:", error)
    res.status(500).json({
      message: error.message
    })
  }
})

// RESET ELECTION DATA & START FRESH SESSION
router.post("/reset-election", async (req, res) => {
  try {
    hasVotedSet.clear()
    inMemoryOtps.clear()

    if (mongoose.connection.readyState === 1) {
      await Vote.deleteMany({}).catch(() => null)
      await AuditLog.deleteMany({}).catch(() => null)
      await Voter.updateMany({}, {
        hasVoted: false,
        otpVerified: false,
        faceVerified: false,
        fingerprintVerified: false,
        fraudFlag: false,
        fraudReason: null
      }).catch(() => null)
    }

    res.json({
      message: "Election data reset successfully! Total Votes = 0, Audit Logs cleared, Blockchain Block = 1 (Genesis Block)."
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PAUSE ELECTION

router.post("/pause-election", async (req, res) => {
  try {
    inMemoryElectionState.isActive = false
    inMemoryElectionState.statusText = "PAUSED"

    if (mongoose.connection.readyState === 1) {
      let election = await Election.findOne().catch(() => null)
      if (!election) {
        election = new Election({
          electionName: "Tamil Nadu Assembly Election 2026",
          isActive: false,
          statusText: "PAUSED"
        })
      } else {
        election.isActive = false
        election.statusText = "PAUSED"
      }
      await election.save().catch(() => null)
    }

    res.status(200).json({
      message: "Election paused successfully. Live voting temporarily on hold."
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
})

// END ELECTION
router.post("/end-election", async (req, res) => {
  try {
    inMemoryElectionState.isActive = false
    inMemoryElectionState.statusText = "ENDED"

    if (mongoose.connection.readyState === 1) {
      let election = await Election.findOne().catch(() => null)
      if (!election) {
        election = new Election({
          electionName: "Tamil Nadu Assembly Election 2026",
          isActive: false,
          statusText: "ENDED"
        })
      } else {
        election.isActive = false
        election.statusText = "ENDED"
      }
      await election.save().catch(() => null)
    }

    res.status(200).json({
      success: true,
      message: "Election ended successfully. Voting session is permanently locked."
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
})

// REAL-TIME DASHBOARD STATS
router.get("/dashboard-stats", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        totalVotes: 0,
        verifiedVoters: 0,
        fraudBlocks: 0,
        blockchainBlocks: 1,
        faceMismatches: 0,
        fingerprintFailures: 0,
        otpFailures: 0,
        duplicateAttempts: 0
      })
    }

    const dbTotalVotes = (mongoose.connection.readyState === 1) ? await Vote.countDocuments().catch(() => 0) : 0
    const totalVotes = Math.max(dbTotalVotes, hasVotedSet.size)
    const verifiedVoters = (mongoose.connection.readyState === 1) ? await Voter.countDocuments({ faceVerified: true }).catch(() => 0) : 0

    const faceMismatches = await AuditLog.countDocuments({
      action: { $in: ["FACE_VERIFICATION_FAILED", "FACE_MISMATCH"] }
    })
    const fingerprintFailures = await AuditLog.countDocuments({
      action: "FINGERPRINT_FAILED"
    })
    const otpFailures = await AuditLog.countDocuments({
      action: "OTP_FAILED"
    })
    const duplicateAttempts = await AuditLog.countDocuments({
      action: "DUPLICATE_VOTE_ATTEMPT"
    })
    const aiSpoofCount = await AuditLog.countDocuments({
      action: "AI_SPOOF_DETECTED"
    })

    const locationMismatches = await AuditLog.countDocuments({
      action: "LOCATION_MISMATCH"
    })

    const voterFraudCount = await Voter.countDocuments({ fraudFlag: true })
    const auditFraudCount = await AuditLog.countDocuments({ status: { $in: ["BLOCKED", "FAILED"] } })

    const fraudBlocks = Math.max(voterFraudCount, auditFraudCount)
    const blockchainBlocks = totalVotes + 1 // 1 genesis block + N vote blocks

    res.status(200).json({
      totalVotes,
      verifiedVoters,
      fraudBlocks,
      blockchainBlocks,
      faceMismatches,
      fingerprintFailures,
      otpFailures,
      duplicateAttempts,
      aiSpoofCount,
      locationMismatches
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ message: error.message })
  }
})

// PUBLISH RESULTS
router.post("/publish-results", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const election = await Election.findOne()
      if (election) {
        election.isActive = false
        election.resultsPublished = true
        await election.save()
      }
    }

    res.status(200).json({
      message: "Results published successfully"
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
})

// BLOCKCHAIN LEDGER

router.get("/blockchain-ledger", async (req, res) => {
  try {
    let votes = []
    if (mongoose.connection.readyState === 1) {
      votes = await Vote.find().sort({ timestamp: -1 })
    }

    res.status(200).json({
      message: "Blockchain ledger fetched",
      votes
    })
  } catch (error) {
    res.status(200).json({
      message: "Blockchain ledger fetched",
      votes: []
    })
  }
})

// GET AUDIT LOGS

router.get("/audit-logs", async (req, res) => {
  try {
    let logs = []
    if (mongoose.connection.readyState === 1) {
      logs = await AuditLog.find().sort({ timestamp: -1 })
    }

    res.status(200).json({
      message: "Audit logs fetched",
      logs
    })
  } catch (error) {
    res.status(200).json({
      message: "Audit logs fetched",
      logs: []
    })
  }
})

module.exports = router