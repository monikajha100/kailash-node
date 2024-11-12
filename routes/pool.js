const mysql = require('mysql2')
const fs = require('fs')
const path = require('path')

// var pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     // password:'1234',
//     database: process.env.DB_NAME,
//     multipleStatements: true,
//     connectionlimit: 100

// })

const pool = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    ssl: {
        ca: process.env.CA_SSL
    }
})

pool.connect((err) => {
    if (err) {
        console.error('Connection failed: ', err.stack);
        return;
    }
    console.log('Connected to Aiven MySQL as id ' + pool.threadId);
});


module.exports = pool