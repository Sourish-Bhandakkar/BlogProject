// index.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 4000;
const DATA_FILE = "posts.json";

// Middleware
app.use(cors());
app.use(express.json());

// Load existing posts or start with empty array
let posts = [];
if (fs.existsSync(DATA_FILE)) {
  const data = fs.readFileSync(DATA_FILE);
  try {
    posts = JSON.parse(data);
  } catch (e) {
    posts = [];
  }
}

// ✅ Test route to verify server is running
app.get("/", (req, res) => {
  res.send("🚀 Blog API is running!");
});

// ✅ Get all posts
app.get("/api/posts", (req, res) => {
  res.json(posts);
});

// ✅ Get single post by ID
app.get("/api/posts/:id", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

// ✅ Create new post
app.post("/api/posts", (req, res) => {
  const newPost = { ...req.body, id: Date.now().toString() };
  posts.push(newPost);
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
  console.log("✅ New post added:", newPost.title);
  res.status(201).json(newPost);
});

// ✅ Update a post
app.put("/api/posts/:id", (req, res) => {
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Post not found" });
  posts[index] = { ...posts[index], ...req.body };
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
  console.log("✏️ Post updated:", posts[index].title);
  res.json(posts[index]);
});

// ✅ Delete a post
app.delete("/api/posts/:id", (req, res) => {
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Post not found" });
  const deleted = posts.splice(index, 1);
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
  console.log("🗑️ Post deleted:", deleted[0].title);
  res.json({ message: "Post deleted" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
