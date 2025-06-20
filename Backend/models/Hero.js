const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  backgroundImage: {
    url: String,
    public_id: String
  },
  ctaButton: {
    text: String,
    link: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Hero', heroSchema);