const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const client = require("../db/db");

//Tapas routing
router.get("/tapasmenu", (req, res) => {
    client.query(`SELECT * FROM tapas`, (err, result) => {
        if(err) {
            res.status(500).json({error: "An error occurred: " + err});         //Check status code!!
        }

        let rows = result.rows

        if(rows.length === 0) {
            res.json([]);
        } else {
            res.json(rows);
        }
    });
});


//Drinks routing
router.get("/drinkmenu", (req, res) => {
    client.query(`SELECT * FROM drinks`, (err, result) => {
        if(err) {
            res.status(500).json({error: "An error occurred: " + err});         //Check status code!!
        }

        let rows = result.rows;

        if(rows.length === 0) {
            res.json([]);
        } else {
            res.json(rows);
        }
    });
});


//Booking routing
router.post("/bookings", (req, res) => {
    const { firstname, surname, email, bookedDate, bookedTime, peopleSum, message } = req.body;
    const errorList = {
        message: [],
        detail: "",
        https_response: {

        }
    }

    if(!firstname) {
        errorList.message.push("Inculed firstname");
    }

    if(!surname) {
        errorList.message.push("Inculed surname");
    }

    if(!email) {
        errorList.message.push("Inculed email");
    }

    if(!bookedDate) {
        errorList.message.push("Inculed booked date");
    }

    if(!bookedTime) {
        errorList.message.push("Inculed booked time");
    }

    if(!peopleSum) {
        errorList.message.push("Inculed amount of people attending");
    }

    //Checking for errors
    if(errorList.message.length > 0) {
        errorList.detail = "Firstname, surname, email, booked date, booked time and group size must be included.";
        errorList.https_response = "Bad request";
        res.status(400).json({ errorList });

    } else {
        let customerID;

        //Checking for existing customer
        client.query(`SELECT customer_id FROM customers WHERE firstname=$1 AND surname=$2 AND email=$3`, [firstname, surname, email], (err, results) => {
            if(err) {
                res.status(500).json({ error: "An error occurred finding customer ID: " + err });
            } else {

                if(results.rows.length === 0){
                    //Inserting new customer
                    client.query(`INSERT INTO customers (firstname, surname, email) VALUES ($1, $2, $3) RETURNING customer_id;`, [firstname, surname, email], (err, result) => {
                        if(err) {
                            res.status(500).json({ error: "An error occurred adding customer: " + err });

                        } else {
                            customerID = result.rows[0].customer_id;
                            addBooking(req, res, customerID);
                        }
                    });

                } else {
                    //Booking for existing customer
                    customerID = results.rows[0].customer_id;
                    addBooking(req, res, customerID);
                }
            }  
        });
    }
});

function addBooking(req, res, customerID) {
    const { bookedDate, bookedTime, peopleSum, message } = req.body;

    //Inserting into bookings
    client.query(`INSERT INTO bookings (customer_id, message, booked_date, booked_time, people) VALUES ($1, $2, $3, $4, $5) RETURNING *;`, 
    [customerID, message, bookedDate, bookedTime, peopleSum], (err, result) => {
        if(err) {
            res.status(500).json({ error: "An error occurred adding booking: " + err });
        } else {
            const bookingInfo = result.rows 
            res.status(200).json({ bookingInfo });
        }
    });
}

//Reviews routing
router.get("/reviews", (req, res) => {
    client.query(`SELECT * FROM reviews`, (err, result) => {
        if(err) {
            res.status(500).json({error: "An error occurred: " + err});         //Check status code!!
        }

        let rows = result.rows;

        if(rows.length === 0) {
            res.json([]);
        } else {
            res.json(rows);
        }
    });
});

router.post("/reviews", (req, res) => {
    const { firstname, surname, email, message } = req.body;
    const errorList = {
        message: [],
        detail: "",
        https_response: {

        }
    }

    if(!firstname) {
        errorList.message.push("Include firstname");
    }

    if(!surname) {
        errorList.message.push("Include firstname");
    }

    if(!email) {
        errorList.message.push("Include email");
    }

    if(!message) {
        errorList.message.push("Include message");
    }

    if(errorList.message.length > 0) {
        errorList.detail = "Firstname, surname, email and review message must be included.";
        errorList.https_response = "Bad request";
        res.status(400).json({ errorList });
    } else {

        //Searching for existing customer
        client.query(`SELECT customer_id FROM customers WHERE firstname=$1 AND surname=$2 AND email=$3;`, [firstname, surname, email], (err, result) => {
            if(err) {
                res.status(500).json({ error: "An error occurred finding customer: " + err });
            } else {
                if(result.rows.length === 0) {

                    //Inserting new customer
                    client.query('INSERT INTO customers (firstname, surname, email) VALUES ($1, $2, $3) RETURNING customer_id;', [firstname, surname, email], (error, results) => {
                        if(error) {
                            res.status(500).json({ error: "An error occurred adding customer: " + err });

                        } else {
                            customerID = results.rows[0].customer_id;
                            addCustomer(req, res, customerID);

                        }
                    });

                } else {
                    customerID = result.rows[0].customer_id;
                    addCustomer(req, res, customerID);
                }
            }
        })
    }
});

//Adding new review
function addCustomer(req, res, customerID) {
    const { message } = req.body;

    //Inserting review
    client.query(`INSERT INTO reviews (customer_id, message) VALUES ($1, $2) RETURNING *;`, [customerID, message], (err, result) => {
        if(err) {
            res.status(500).json({ error: "An error occurred: " + err });
        } else {
            const finalReview = result.rows;
            res.status(200).json({ finalReview });
        }
    });
}

module.exports = router;