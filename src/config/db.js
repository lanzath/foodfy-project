const { Pool } = require('pg');

module.exports = new Pool({
    user: 'postgres',
    password: 'secret',
    host: 'localhost',
    port: 5432,
    database: 'foodfy'
});
