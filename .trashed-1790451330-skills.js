const express = require('express');
const router = express.Router();

// GET /api/skills - list all skill categories the app supports
router.get('/', (req, res) => {
  res.json({
    ok: true,
    skills: [
      { key: 'Construction Labour', icon: '👷' },
      { key: 'Dukaan Helper', icon: '🛒' },
      { key: 'Restaurant/Kitchen', icon: '🍳' },
      { key: 'Loading-Unloading', icon: '📦' },
      { key: 'Painter', icon: '🎨' },
      { key: 'Electrician', icon: '💡' },
      { key: 'Cooking', icon: '👩‍🍳' },
      { key: 'House Cleaning', icon: '🧹' }
    ]
  });
});

module.exports = router;
