const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();
const upload = multer({ dest: 'uploads/' });
mongoose.connect('mongodb://localhost:27017/directory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: String,
  about: String,
  expertise: String,
  photos: [String],
});

const User = mongoose.model('User', userSchema);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/register', upload.array('photos', 5), async (req, res) => {
  try {
    const { name, about, expertise } = req.body;
    const photos = req.files.map((file) => file.path);

    const newUser = new User({
      name,
      about,
      expertise,
      photos,
    });

    await newUser.save();
    res.redirect('/confirmation.html');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
