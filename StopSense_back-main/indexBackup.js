const { clipTable, userTable } = require("./mockData");

const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;
const Clip = require("./models/Clip"); // อย่าลืม path ให้ถูก
const User = require('./models/User');

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request body

const mongoose = require("mongoose");

// Middleware
app.use(express.json()); // for parsing JSON

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/stopsence")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

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
console.log(clip)
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

app.post('/clips', async (req, res) => {
  try {
    const {
      clip_id,
      user_id,
      name,
      videopath,
      upload_date,
      number_conflict
    } = req.body;

    if (!clip_id || !user_id || !name || !videopath) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newClip = new Clip({
      clip_id,
      user_id,
      name,
      videopath,
      upload_date,
      number_conflict
    });

    await newClip.save();

    res.status(201).json({ message: 'Clip created successfully', clip: newClip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/clips/:clip_id', async (req, res) => {
  const { clip_id } = req.params;

  try {
    const result = await Clip.findOneAndDelete({ clip_id: clip_id });

    if (!result) {
      return res.status(404).json({ success: false, message: '❌ Clip not found' });
    }

    res.status(200).json({ success: true, message: '✅ Clip deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '❗ Server error' });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({
    $or: [{ username }, { email: username }],
    password // 🛑 เปรียบเทียบแบบ plain text แค่เพื่อทดสอบ (ควร hash จริง)
  });

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid user or password" });
  }

  user.status = "active";
  await user.save();

  res.json({ success: true, message: "Login successful", user_id: user.user_id });
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
    return res.status(401).json({ success: false, message: "Passwords do not match" });
  }

  if (!username || !email) {
    return res.status(401).json({ success: false, message: "Invalid email or username" });
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res.status(401).json({ success: false, message: "Email or username already exists" });
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

  res.status(200).json({ success: true, message: "Account created successfully" });
});


// เชื่อมต่อกับ MongoDB
mongoose.connect("mongodb://localhost:27017/stopsence", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Start server


// app.get("/", (req, res) => {
//   res.send("hello");
// });

// // get only 1 item
// app.get("/getClipID/:clip_id", (req, res) => {
//   const { clip_id } = req.params;

//   // Find the clip with the matching clip_id
//   const clip = clipTable.find((item) => item.clip_id === clip_id);

//   if (!clip) {
//     return res.status(404).json({ error: "Clip not found" });
//   }

//   console.log(clip); // Log the found clip

//   res.json(clip); // Send the clip as JSON response
// });

// // Get All Clips
// app.post("/getAllClips", (req, res) => {
//   const { user_id } = req.body; // Extract user_id from request body

//   if (!user_id) {
//     return res.status(400).json({ error: "Missing user_id in request body" });
//   }

//   const userClips = clipTable.filter((item) => item.user_id === user_id);

//   if (userClips.length === 0) {
//     return res.status(404).json({ error: "No clips found for this user" });
//   }

//   return res.status(200).json({ success: true, clips: userClips });
// });

// // app.post('/createUser', (req, res) => {
// //     const { username, email } = req.body;
// //     res.json({ message: `User Created: ${username}, Email: ${email}` });
// // });

// // Uesr login
// app.post("/login", (req, res) => {
//   const { username, password } = req.body;

//   // username also equal email

//   try {
//     // console.log(username, password)
//     const user = userTable.find(
//       (user) =>
//         user.username === username ||
//         (user.email === username && user.password === password)
//     );

//     if (!user) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid user or password" });
//     }

//     user.status = "active";

//     console.log("new:", userTable);
//     return res.json({
//       success: true,
//       message: "Login successful",
//       user_id: user.user_id,
//     });
//   } catch {
//     return res
//       .status(401)
//       .json({
//         success: false,
//         message: "Invalid user or password",
//         user_id: null,
//       });
//   }
// });

// app.put("/logout", (req, res) => {
//   const { user_id } = req.body;

//   if (!user_id) {
//     return res.status(400).json({ success: false, message: "Missing user_id" });
//   }

//   try {
//     // Find the user in the userTable
//     const user = userTable.find((user) => user.user_id === user_id);

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     user.status = "inactive";

//     return res.json({ success: true, message: "Logout successful", user });
//   } catch (error) {
//     console.error("Error during logout:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server error" });
//   }
// });

// app.post("/register", (req, res) => {
//   const { email, username, password, confirmPassword } = req.body;

//   console.log(req.body);

//   if (password != confirmPassword || password === "") {
//     return res
//       .status(401)
//       .json({ success: false, message: "Passwords do not match" });
//   }

//   if (!username || !email) {
//     return res
//       .status(401)
//       .json({ success: false, message: "Invalid email or username" });
//   }

//   if (userTable.some((item) => item.email === email)) {
//     return res
//       .status(401)
//       .json({ success: false, message: "This email is already used" });
//   }

//   if (userTable.some((item) => item.username === username)) {
//     return res
//       .status(401)
//       .json({ success: false, message: "Username is already used" });
//   }

//   const d = new Date();
//   let year = d.getFullYear();
//   let month = (d.getMonth() + 1).toString().padStart(2, "0"); // Corrected month formatting
//   let day = d.getDate().toString().padStart(2, "0");

//   const date = `${year}-${month}-${day}`;

//   let data = {
//     user_id: "U" + d.getTime(),
//     email,
//     username,
//     password, // Consider hashing the password before storing
//     user_type: "user",
//     create_date: date,
//     modify_date: date,
//   };

//   userTable.push(data);

//   console.log("New user added:", data);

//   return res
//     .status(200)
//     .json({ success: true, message: "Account created successfully" });
// });

// app.post("/uploadClip", (req, res) => {
//   const { user_id, name, width, distance, point, descripton } = req.body;

//   if (!user_id || !name || width === 0 || distance === 0) {
//     return res
//       .status(401)
//       .json({ success: false, message: "Invalid input data" });
//   }

//   if (!Array.isArray(point) || point.length !== 4) {
//     return res
//       .status(401)
//       .json({ success: false, message: "require 4 points" });
//   }

//   const d = new Date();

//   let year = d.getFullYear();
//   let month = d.getMonth() > 9 ? d.getMonth() : "0" + (d.getMonth() + 1);
//   let day = d.getDate() > 9 ? d.getDate() : "0" + d.getDate();

//   const date = `${year}-${month}-${day}`;

//   let data = {
//     clip_id: "C" + d.getTime(),
//     user_id,
//     name,
//     video_path: "/video/",
//     upload_date: date,

//     number_conflict: 20,
//     width,
//     distance,
//     point,
//     descripton,
//   };

//   clipTable.push(data);
//   console.log("new data added:", clipTable);

//   return res
//     .status(200)
//     .json({ success: true, message: "Upload Clip Complete" });
// });

// app.delete("/deleteClip", (req, res) => {
//   const { clip_id } = req.body; // Correctly extract clip_id

//   console.log("Received delete request for clip_id:", clip_id);
//   console.log("Old ClipTable:", clipTable);

//   // Validate if clip_id is provided
//   if (!clip_id) {
//     return res
//       .status(400)
//       .json({ status: "error", message: "Missing clip_id in request" });
//   }

//   // Find index of the clip to delete
//   const index = clipTable.findIndex((clip) => clip.clip_id === clip_id);

//   if (index !== -1) {
//     clipTable.splice(index, 1); // Remove the clip

//     console.log("Updated ClipTable:", clipTable);
//     return res
//       .status(200)
//       .json({ status: "success", message: "Clip deleted successfully" });
//   }

//   return res.status(404).json({ status: "error", message: "Clip not found" });
// });

// app.get("/dataOverView/:user_id", (req, res) => {
//   const { user_id } = req.params;

//   const userClips = clipTable.filter((item) => item.user_id === user_id);
//   let conflictCount = 0;
//   let activeUser = 0;
//   let clipsCount = 0;

//   userClips.map((item) => {
//     conflictCount += item.number_conflict;
//   });
//   userTable.map((item) => {
//     activeUser += item.status === "active";
//   });

//   clipsCount = userClips.length;

//   // console.log(conflictCount)
//   // console.log(clipsCount)
//   // console.log(activeUser)
//   return res.status(200).json({
//     status: "success",
//     message: "get data complete",
//     data: {
//       conflictCount,
//       clipsCount,
//       activeUser,
//     },
//   });
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });
