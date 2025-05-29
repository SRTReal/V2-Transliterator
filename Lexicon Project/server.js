const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // To serve files

const app = express();
let lexiconEntries = [];

// Middleware to parse JSON data
app.use(bodyParser.json());

// Serve static files from the main folder
app.use(express.static(path.join(__dirname, '..'))); // Assuming your project folder is inside the main folder

// Serve the index.html file at root '/'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Path to your index.html file
});

// API to get lexicon entries
app.get('/api/lexicon', (req, res) => {
  res.json(lexiconEntries); // Sends lexicon data back to client
});

// API to save lexicon entries
app.post('/api/lexicon', (req, res) => {
  lexiconEntries = req.body; // Update lexicon entries
  res.json({ message: 'Lexicon entries saved successfully!' });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
