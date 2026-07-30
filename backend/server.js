const express = require("express")
const cors = require("cors")
const path = require("path")

require("dotenv").config()

const connectDB = require("./config/db")
const voterRoutes = require("./routes/voterRoutes")
const candidateRoutes = require("./routes/candidateRoutes")
const faceImageRoutes = require("./routes/faceImageRoutes")

connectDB()

const app = express()

app.use(cors())

app.use(
  express.json({
    limit: "20mb",
  })
)

app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
)

// Allow browser/Python service to access locally saved images
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
)

// API routes
app.use("/api/voters", voterRoutes)

app.use(
  "/api/candidates",
  candidateRoutes
)

app.use(
  "/api/face-images",
  faceImageRoutes
)

app.get("/", (req, res) => {
  res.send("Vortura Backend Running")
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  )
})