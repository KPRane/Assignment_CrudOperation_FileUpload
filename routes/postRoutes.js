const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const multer = require('multer');
const xlsx = require('xlsx');
const csv = require('csv-parser');
const fs=require('fs');


mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error(error));
mongoose.connection.on('connected', () => {
    console.log('Connected to database!');
  });
  

const User = require("../db/UserSchema");

const Data = require("../db/UserSchema");

const Account = require("../db/AccountSchema");

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;

  // Check if a file was uploaded
  if (!file) {
    res.status(400).send('No file uploaded');
    return;
  }

  // Parse the uploaded file based on its extension (XLSX or CSV)
  if (file.originalname.endsWith('.xlsx')) {
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    saveDataToMongoDB(data, res);
  } else if (file.originalname.endsWith('.csv')) {
    const data = [];
    const stream = csv()
      .on('data', row => {
        data.push(row);
      })
      .on('end', () => {
        saveDataToMongoDB(data, res);
      });
    fs.createReadStream(file.path).pipe(stream);
  } else {
    res.status(400).send('Invalid file format');
  }
});

// Function to save data to MongoDB
function saveDataToMongoDB(data, res) {
  // Save each row of data to MongoDB
  data.forEach(row => {
    const newData = new Data({
      name: row.name,
      email: row.email,
      age: row.age
    });
    newData.save();
  });

  // Send a response to the client
  res.status(200).send('File uploaded successfully');
}

// Routes for User CRUD operations
router.post('/user', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = new User({ name, email, phone });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json(user);
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.put('/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, phone } = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, { name, email, phone }, { new: true });
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json({ message: 'User updated successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.delete('/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json({ message: 'User deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});
router.post('/account', async (req, res) => {
  try {
    const { name, type, balance } = req.body;
    const account = new Account({ name, type, balance });
    await account.save();
    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});
router.get('/account/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const account = await Account.findById(id);
    if (!account) {
      res.status(404).json({ message: 'account not found' });
    } else {
      res.status(200).json(account);
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});
router.put('/account/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, type, balance } = req.body;
    const updatedAccount= await User.findByIdAndUpdate(id, { name, type, balance }, { new: true });
    if (!updatedAccount) {
      res.status(404).json({ message: 'Account not found' });
    } else {
      res.status(200).json({ message: 'Account updated successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});
router.delete('/account/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deletedAccount = await User.findByIdAndDelete(id);
    if (!deletedAccount) {
      res.status(404).json({ message: 'Account not found' });
    } else {
      res.status(200).json({ message: 'Account deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});


  module.exports = router;
