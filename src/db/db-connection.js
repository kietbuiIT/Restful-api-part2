const dotenv = require('dotenv');
dotenv.config();
const mysql2 = require('mysql2');

class DBConnection {
    constructor() {
        this.db = mysql2.createPool({
            host: process.env.HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT,
        });
        this.checkConnection();
    }

    checkConnection() {
        this.db.getConnection( (err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.log('Database connection was closed.');
                }
                if (err.code === 'ER_CON_COUNT_ERROR') { 
                    console.log('Database has too many connections.');
                }
                if (err.code === 'ECONNREFUSED') {
                    console.log('Database connection was refused.');
                }
            }
            if (connection) {
                connection.release();
            }
            return;
        });
    }

    query = async (sql, values) => {
        return new Promise( (resolve, reject) => {
            const callback = (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            }
            this.db.execute(sql, values, callback);
        }).catch( err => {
            const mysqlErrorList = Object.keys(HttpStatusCodes);
            // convert mysql errors which in the mysqlErrorList list to http status code
            err.status = mysqlErrorList.includes(err.code) ? HttpStatusCodes[err.code] : err.status;
            
            throw err;
        })
    }
}

//like ENUM
const HttpStatusCodes = Object.freeze({
    ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: 422,
    ER_DUP_ENTRY: 409,
});

module.exports = new DBConnection().query;