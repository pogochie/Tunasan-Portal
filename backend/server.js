const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const path = require('path');

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use("/uploads", express.static("uploads"));

// Routes
app.use('/api/incidents', require('./routes/incidents'));

// Fallback for SPA (only for GET requests)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));