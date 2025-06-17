const { clipTable, userTable } = require("./mockData");

const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;
const Clip = require("./models/Clip"); // อย่าลืม path ให้ถูก
const User = require("./models/User");

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request body

const mongoose = require("mongoose");

// Middleware
app.use(express.json()); // for parsing JSON

  // เชื่อมต่อกับ MongoDB
mongoose
  .connect("mongodb://localhost:27017/stopsence", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// // Sample schema
// const ClipSchema = new mongoose.Schema({
//   filename: String,
//   path: String
// });

// const Clip = mongoose.model('Clip', ClipSchema);

// Sample route
app.get("/files", async (req, res) => {
  try {
    // const clip = await Clip.findOne({ filename: req.params.filename });
    // const clip = await Clip.findOne({ filename: 'Bake@DomeV3.mp4' });
    const clip = await Clip.find();
    console.log(clip);
    if (!clip) return res.status(404).send("File not found");
    res.json(clip);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// app.get('/test-mongo', async (req, res) => {
//     try {
//       const files = await File.find({});
//       res.status(200).json(files);
//     } catch (err) {
//       res.status(500).send('❗ MongoDB Error: ' + err.message);
//     }
//   });

app.post("/clips", async (req, res) => {
  try {
    const { clip_id, user_id, name, videopath, upload_date, number_conflict } =
      req.body;

    if (!clip_id || !user_id || !name || !videopath) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newClip = new Clip({
      clip_id,
      user_id,
      name,
      videopath,
      upload_date,
      number_conflict,
    });

    await newClip.save();

    res
      .status(201)
      .json({ message: "Clip created successfully", clip: newClip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/clips/:clip_id", async (req, res) => {
  const { clip_id } = req.params;

  try {
    const result = await Clip.findOneAndDelete({ clip_id: clip_id });

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "❌ Clip not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "✅ Clip deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "❗ Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({
    $or: [{ username }, { email: username }],
    password, // 🛑 เปรียบเทียบแบบ plain text แค่เพื่อทดสอบ (ควร hash จริง)
  });

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid user or password" });
  }

  user.status = "active";
  await user.save();

  res.json({
    success: true,
    message: "Login successful",
    user_id: user.user_id,
  });
});

app.put("/logout", async (req, res) => {
  const { user_id } = req.body;

  const user = await User.findOne({ user_id });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  user.status = "inactive";
  await user.save();

  res.json({ success: true, message: "Logout successful", user });
});

// API สำหรับการลงทะเบียนผู้ใช้
app.post("/register", async (req, res) => {
  const { email, username, password, confirmPassword } = req.body;

  if (password !== confirmPassword || !password) {
    return res
      .status(401)
      .json({ success: false, message: "Passwords do not match" });
  }

  if (!username || !email) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or username" });
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res
      .status(401)
      .json({ success: false, message: "Email or username already exists" });
  }

  const d = new Date();
  const date = d.toISOString().split("T")[0];

  const user = new User({
    user_id: "U" + d.getTime(),
    email,
    username,
    password, // 🛑 อย่าลืมเปลี่ยนเป็น hash จริงในการใช้งานจริง
    create_date: date,
    modify_date: date,
  });

  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Account created successfully" });
});

app.get('/', (req,res) => {
  return res.json('asd')
})


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});