const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// POST - Submit new application
router.post('/', async (req, res) => {
  try {
    const {
      name, age, email, phone, whatsapp,
      department, skills, cvLink, portfolioLink,
      bio, additionalInfo
    } = req.body;

    // Basic validation
    if (!name || !age || !email || !phone || !whatsapp || !department) {
      return res.status(400).json({ message: 'جميع الحقول المطلوبة يجب ملؤها' });
    }

    // Parse skills: can be a JSON string or a plain comma-separated string
    let parsedSkills = [];
    if (skills) {
      try { parsedSkills = JSON.parse(skills); }
      catch { parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean); }
    }

    const application = new Application({
      name, age: parseInt(age), email, phone, whatsapp,
      department,
      skills: parsedSkills,
      cvLink: cvLink || '',
      portfolioLink: portfolioLink || '',
      bio: bio || '',
      additionalInfo: additionalInfo || ''
    });

    await application.save();
    res.status(201).json({ message: 'تم تقديم الطلب بنجاح!', id: application._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في حفظ الطلب', error: err.message });
  }
});

module.exports = router;
