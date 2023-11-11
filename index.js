const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const port = process.env.PORT || 8003;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect("mongodb://127.0.0.1:27017/upload", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connection to MongoDB successful"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const db = mongoose.connection;
db.on('error', () => console.error("Error connecting to the database"));
db.once('open', () => console.log("Connected to the database"));

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    image: String // To store the path of the image
});

const User = mongoose.model('User', userSchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single('image'), (req, res) => {
  const newImage = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    image: 'images/' + req.file.filename // Save the path of the uploaded image
  });

  newImage.save()
    .then(() => {
      console.log("Image uploaded and user saved successfully");
      return res.redirect('index.html');
    })
    .catch((err) => {
      console.error("Error saving user and uploading image:", err);
      return res.status(500).send("Error saving user and uploading image");
    });
});

app.get("/", (req, res) => {
  res.send("Hello from Kaif");
  return res.redirect('hsk.html');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
