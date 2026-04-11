const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Determine which database to use based on environment variable
const dbType = process.env.DB_TYPE || 'postgres'; // default to postgres

switch (dbType) {
  case 'postgres':
    sequelize = new Sequelize(
      process.env.POSTGRES_DB || 'codveda_level2',
      process.env.POSTGRES_USER || 'postgres',
      process.env.POSTGRES_PASSWORD || 'postgres',
      {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
      }
    );
    break;
    
  case 'mysql':
    sequelize = new Sequelize(
      process.env.MYSQL_DB || 'codveda_level2',
      process.env.MYSQL_USER || 'root',
      process.env.MYSQL_PASSWORD || '',
      {
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
      }
    );
    break;
    
  case 'sqlite':
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: process.env.SQLITE_STORAGE || './database.sqlite',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    });
    break;
    
  default:
    throw new Error(`Unsupported database type: ${dbType}`);
}

// Initialize models
const db = {};

db.sequelize = sequelize;

// Import models
const fs = require('fs');
const path = require('path');

const modelsPath = path.join(__dirname, dbType);
fs.readdirSync(modelsPath)
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const model = require(path.join(modelsPath, file))(sequelize);
    db[model.name] = model;
  });

// Associate models (if any associations exist)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;