const { Client } = require("pg");
require("dotenv").config();

//Connecting to server
const client = new Client ({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect((error) => {
    if(error) {
        console.log("Fel vid anslutning: " + error);
    } else {
        console.log("Ansluten till databasen...")
    }
});

//Creating tables
client.query(`
    DROP TABLE IF EXISTS users CASCADE;
    CREATE TABLE users (
        username    VARCHAR(20) PRIMARY KEY,
        password    VARCHAR NOT NULL
    )
`);

client.query(`
    DROP TABLE IF EXISTS drinks CASCADE;
    CREATE TABLE drinks (
        drink_code     SERIAL PRIMARY KEY,
        name            VARCHAR(15),
        description     VARCHAR(50),
        availability    BOOLEAN DEFAULT TRUE,
        price           INT
    )   
`);

client.query(`
    DROP TABLE IF EXISTS tapas CASCADE;
    CREATE TABLE tapas (
        tapas_code      SERIAL PRIMARY KEY,
        name            VARCHAR(15),
        description     VARCHAR(50),
        availability    BOOLEAN DEFAULT TRUE,
        price           INT
    )
`);

client.query(`
    DROP TABLE IF EXISTS edited_drinks;
    CREATE TABLE edited_drinks (
        update_id   SERIAL PRIMARY KEY,
        username    VARCHAR(10),
        drink_code  INT,
        FOREIGN KEY(username) REFERENCES users(username),
        FOREIGN KEY(drink_code) REFERENCES drinks(drink_code)
    )
`);

client.query(`
    DROP TABLE IF EXISTS edited_tapas;
    CREATE TABLE edited_tapas (
        update_id   SERIAL PRIMARY KEY,
        username    VARCHAR(10),
        tapas_code  INT,
        FOREIGN KEY(username) REFERENCES users(username),
        FOREIGN KEY(tapas_code) REFERENCES tapas(tapas_code)
    )
`);

client.query(`
    DROP TABLE IF EXISTS customers CASCADE;
    CREATE TABLE customers (
        customer_id SERIAL PRIMARY KEY,
        firstname   VARCHAR(10),
        surname     VARCHAR(15),
        email       VARCHAR(40) NOT NULL
    )
`);

client.query(`
    DROP TABLE IF EXISTS bookings CASCADE;
    CREATE TABLE bookings (
        booking_num     SERIAL PRIMARY KEY,
        customer_id     INT,
        message         VARCHAR(100),
        booked_date     DATE NOT NULL,
        booked_time     TIME NOT NULL,
        people          INT NOT NULL,
        created         DATE DEFAULT CURRENT_DATE,
        confirmed       BOOLEAN DEFAULT FALSE,
        FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
    )
`);

client.query(`
    DROP TABLE IF EXISTS handled_bookings;
    CREATE TABLE handled_bookings (
        update_id   SERIAL PRIMARY KEY,
        username    VARCHAR(10),
        booking_num INT,
        FOREIGN KEY(username) REFERENCES users(username),
        FOREIGN KEY(booking_num) REFERENCES bookings(booking_num)
    )
`);

client.query(`
    DROP TABLE IF EXISTS reviews;
    CREATE TABLE reviews (
        message_id  SERIAL PRIMARY KEY,
        customer_id INT,
        message     VARCHAR(100),
        FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
    )
`);

client.query(`
    CREATE VIEW bookingSummary AS 
    SELECT bookings.booking_num, bookings.message, bookings.booked_date, bookings.booked_time, bookings.people, bookings.created, bookings.confirmed, customers.customer_id, customers.firstname, customers.surname, customers.email
    FROM bookings
    LEFT JOIN customers ON bookings.customer_id = customers.customer_id;
`);