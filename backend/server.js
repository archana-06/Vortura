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

const allowedOrigins = [
  "http://localhost:5173",
  "https://archana-06.github.io",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allows requests without an origin, such as Postman and Selenium API calls
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

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
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vortura backend is running",
    environment: process.env.NODE_ENV || "development",
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});