const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

let users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, department: 'engineering', createdAt: new Date().toISOString() },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, department: 'design', createdAt: new Date().toISOString() }
];
let nextId = 3;


app.get('/api/users', (req, res) => {
    res.json(users);
});

app.get('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
});

app.post('/api/users', (req, res) => {
    const { name, email, age, department } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const newUser = {
        id: nextId++,
        name,
        email,
        age: age || null,
        department: department || null,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const { name, email, age, department } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    
    users[userIndex] = { 
        id, 
        name, 
        email, 
        age: age || null, 
        department: department || null,
        createdAt: users[userIndex].createdAt,
        updatedAt: new Date().toISOString()
    };
    res.json(users[userIndex]);
});

app.delete('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    res.json({ message: 'User deleted successfully', user: deletedUser });
});

app.get('/', (req, res) => {
    res.json({ 
        message: 'Codveda Internship API',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            health: '/api/health'
        }
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API is running', users_count: users.length });
});

app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        available_endpoints: [
            'GET /',
            'GET /api/health',
            'GET /api/users',
            'GET /api/users/:id',
            'POST /api/users',
            'PUT /api/users/:id',
            'DELETE /api/users/:id'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`REST API server running on port ${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`  GET    / - API info`);
    console.log(`  GET    /api/health - Health check`);
    console.log(`  GET    /api/users - Get all users`);
    console.log(`  GET    /api/users/:id - Get user by ID`);
    console.log(`  POST   /api/users - Create new user`);
    console.log(`  PUT    /api/users/:id - Update user`);
    console.log(`  DELETE /api/users/:id - Delete user`);
});
