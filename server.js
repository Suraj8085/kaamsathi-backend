const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Sample Labour Data for App
const labourers = [
  { id: 1, name: "Ramesh Kumar", skill: "Construction Labour", location: "Damoh", phone: "9876543210" },
  { id: 2, name: "Suresh Patel", skill: "Painter", location: "Damoh", phone: "9876543211" }
];

app.get('/', (req, res) => {
  res.send('KaamSathi Backend API is Running Successfully!');
});

app.get('/api/labour', (req, res) => {
  res.json({ success: true, data: labourers });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
