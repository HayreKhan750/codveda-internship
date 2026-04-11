
db = db.getSiblingDB('codveda_level3');

db.createUser({
  user: 'codveda_user',
  pwd: 'codveda_password',
  roles: [
    {
      role: 'readWrite',
      db: 'codveda_level3'
    }
  ]
});

db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });
db.users.createIndex({ department: 1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });

db.createCollection('messages');
db.messages.createIndex({ sender: 1, recipient: 1 });
db.messages.createIndex({ timestamp: 1 });
db.messages.createIndex({ sender: 1 });
db.messages.createIndex({ recipient: 1 });

db.createCollection('notifications');
db.notifications.createIndex({ user: 1, isRead: 1 });
db.notifications.createIndex({ createdAt: 1 });
db.notifications.createIndex({ type: 1 });

db.users.insertOne({
  name: 'System Administrator',
  email: 'admin@codveda.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5GS', // bcrypt of admin123
  age: 30,
  department: 'IT',
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

db.users.insertMany([
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5GS', // bcrypt of password123
    age: 25,
    department: 'Engineering',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5GS', // bcrypt of password123
    age: 28,
    department: 'Design',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5GS', // bcrypt of password123
    age: 32,
    department: 'Marketing',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('Database initialization completed for Level 3');
print('Admin user: admin@codveda.com / admin123');
print('Sample users: john@example.com, jane@example.com, mike@example.com / password123');
