const express = require('express');
const router = express.Router();
const Tutorial = require('../models/Tutorial');

router.get('/', async (req, res) => {
  try {
    const tutorials = await Tutorial.find().sort({ createdAt: -1 });
    res.status(200).json(tutorials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/add', async (req, res) => {
  try {
    const newTutorial = new Tutorial({
      title: req.body.title,
      url: req.body.url,
      tag: req.body.tag,
    });
    const savedTutorial = await newTutorial.save();
    res.status(201).json(savedTutorial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Tutorial.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Tutorial deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
