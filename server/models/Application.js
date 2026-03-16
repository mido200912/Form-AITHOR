const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // ── Personal Info ──
  name:      { type: String, required: true, trim: true },
  age:       { type: Number, required: true },
  email:     { type: String, required: true, trim: true, lowercase: true },
  phone:     { type: String, required: true, trim: true },
  whatsapp:  { type: String, required: true, trim: true },

  // ── Professional ──
  department: {
    type: String,
    required: true,
    enum: ['graphic-design', 'video-editing', 'backend', 'marketing', 'pr', 'ai', 'hr']
  },
  skills:         { type: [String], default: [] },   // e.g. ["Photoshop", "Figma"]

  // ── Files & Links ──
  cvLink:         { type: String, trim: true, default: '' },  // Google Drive link
  portfolioLink:  { type: String, trim: true, default: '' },

  // ── About ──
  bio:            { type: String, trim: true, default: '' },  // About yourself
  additionalInfo: { type: String, trim: true, default: '' },  // Extra info

  // ── Admin fields ──
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  notes:     { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
