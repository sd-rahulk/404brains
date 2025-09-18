const express = require( "express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./token.json");

const app = express();

// Configure CORS
app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:8082"], // allowed origins
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.post("/generateToken", async (req, res) => {
  const { uid, email } = req.body;

  try {
    const customToken = await admin.auth().createCustomToken(uid, { email });
    res.json({ token: customToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create token" });
  }
});

app.listen(5000, () => console.log("Token server running on http://localhost:5000"));
