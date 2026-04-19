const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Codveda Internship - Level 1 API Server' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is healthy' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
