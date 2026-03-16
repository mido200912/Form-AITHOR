const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Application = require('../models/Application');
const authMiddleware = require('../middleware/auth');

// POST - Admin Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, message: 'Login successful' });
  }
  return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غلط' });
});

// GET - All applications (with optional filters)
router.get('/applications', authMiddleware, async (req, res) => {
  try {
    const { department, status, search } = req.query;
    const query = {};
    if (department && department !== 'all') query.department = department;
    if (status     && status     !== 'all') query.status     = status;
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    const applications = await Application.find(query).sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الطلبات' });
  }
});

// GET - Stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [total, pending, reviewed, accepted, rejected, byDept] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ status: 'reviewed' }),
      Application.countDocuments({ status: 'accepted' }),
      Application.countDocuments({ status: 'rejected' }),
      Application.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }])
    ]);
    res.json({ total, pending, reviewed, accepted, rejected, byDept });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الإحصائيات' });
  }
});

// PATCH - Update application status/notes
router.patch('/applications/:id', authMiddleware, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    if (!app) return res.status(404).json({ message: 'الطلب غير موجود' });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في تحديث الطلب' });
  }
});

// DELETE - Delete application
router.delete('/applications/:id', authMiddleware, async (req, res) => {
  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ message: 'الطلب غير موجود' });
    res.json({ message: 'تم حذف الطلب' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الحذف' });
  }
});

module.exports = router;
