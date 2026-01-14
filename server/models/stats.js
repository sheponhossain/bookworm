const express = require('express');
const router = express.Router();
const UserStats = require('../models/UserStats');

router.get('/:email', async (req, res) => {
  try {
    let stats = await UserStats.findOne({ userEmail: req.params.email });

    if (!stats) {
      stats = await UserStats.create({ userEmail: req.params.email });
    }
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const Genre =
  mongoose.models.Genre ||
  mongoose.model(
    'Genre',
    new mongoose.Schema({
      name: { type: String, required: true, unique: true },
    })
  );

router.patch('/update-goal', async (req, res) => {
  const { email, newGoal } = req.body;
  try {
    const updatedStats = await UserStats.findOneAndUpdate(
      { userEmail: email },
      { annualGoal: newGoal },
      { new: true }
    );
    res.json(updatedStats);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
