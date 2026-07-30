const express = require("express")
const router = express.Router()

const Candidate = require("../models/Candidate")

// Get all candidates
router.get("/", async (req, res) => {
  try {
    const defaultCandidates = [
      {
        name: "Dr. MK Stalin",
        party: "DMK",
        constituency: "Chennai South",
        symbol: "☀️",
        photo: "https://upload.wikimedia.org/wikipedia/commons/e/ea/M_K_Stalin_in_2021.jpg",
        status: "ACTIVE"
      },
      {
        name: "Edappadi K. Palaniswami",
        party: "AIADMK",
        constituency: "Salem West",
        symbol: "🍃",
        photo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Edappadi_K._Palaniswami_in_2020.jpg",
        status: "ACTIVE"
      },
      {
        name: "K. Annamalai",
        party: "BJP",
        constituency: "Coimbatore South",
        symbol: "🪷",
        photo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/K._Annamalai.jpg",
        status: "ACTIVE"
      },
      {
        name: "Seeman",
        party: "NTK",
        constituency: "Chennai Central",
        symbol: "🪓",
        photo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Seeman_in_2021.jpg",
        status: "ACTIVE"
      }
    ]

    const dbCandidates = await Candidate.find().catch(() => [])

    const map = new Map()
    defaultCandidates.forEach(c => map.set(c.name.toLowerCase(), c))
    dbCandidates.forEach(c => {
      if (c.status === "ACTIVE" || !c.status) {
        map.set((c.name || c.candidateName).toLowerCase(), c)
      }
    })

    res.json(Array.from(map.values()))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Add candidate
router.post("/add", async (req, res) => {

  const candidate =
    new Candidate(req.body)

  await candidate.save()

  res.json({
    message:
      "Candidate added successfully"
  })

})

module.exports = router