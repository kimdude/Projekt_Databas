const { Client } = require("pg");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const client = require("../db/db");
const authenticateToken = require("../middleware/authenticate");

/* Users routing */
//Validating user
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        let passwordMatch;

        if(!username || !password ) {
            return res.status(400).json({ error: "Invalid username or password"});
        }


        //Checking for user
        client.query(`SELECT * FROM users WHERE username=$1`, [username], async (err, results) => {
            if(err) {
                return res.status(500).json({ error: "An error occurred"});
            }

            if(results.rows.length === 0) {
                return res.status(400).json({ error: "Invalid username or password"});
            } 

            const user = results.rows[0]
            passwordMatch = await comparePassword(user, password);


            if(!passwordMatch) {
                return res.status(401).json({ error: "Invalid username or password" });

            } else {

                //Creating JWT token
                const payload = { username: username };
                const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: "1h"});
                const response = {
                    message: "User logged in",
                    token: token
                }

                res.status(200).json({ response });
            }
        });

    } catch(err) {
        res.status(200).json({ error: "Server error"});
    }
});

//Comparing password
async function comparePassword(user, tryPassword) {
    try {
        return await bcrypt.compare(tryPassword, user.password);
    } catch(error) {
        throw error;
    }
}

//Adding users
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const errorList = {
        message: [],
        detail: "",
        https_resonse: {
        }
    };
    
    if(!username) {
       errorList.message.push("Insert username");
    }

    if(!password) {
        errorList.message.push("Insert password");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if(errorList.message.length > 0) {
        errorList.detail = "Include username and password.";
        errorList.https_resonse.message = "Bad request";
        return res.status(400).json({ errorList });

    } 

    //Inserting user info
    client.query(`INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *;`, [username, hashedPassword], (err, results) => {
        if(err) {
            return res.status(500).json({ error: "An error occurred" });
        }

        res.status(200).json("User registered");

    });
});


/* Bookings routing */
//Sending bookings
router.get("/bookings", authenticateToken, (req, res) => {
    client.query(`SELECT * FROM bookingSummary`, (err, result) => {
        if(err) {
            return res.status(500).json({error: "An error occurred: " + err});         //Check status code!!
        }

        let rows = result.rows;

        if(rows.length === 0) {
            res.json([]);
        } else {
            res.json(rows);
        }
    });
});

//Editing bookings
router.put("/bookings/:id", authenticateToken, (req, res) => {
    let bookingNr = req.params.id;
    let user = req.username.username;
    let { message, booked_date, booked_time, people, confirmed } = req.body;

    const errorList = {
        message: [],
        detail: "",
        https_response: {
        }
    };
    
    if(!booked_date) {
        errorList.message.push("Insert date for booking");
    }

    if(!booked_time) {
        errorList.message.push("Insert time for booking");
    }

    if(!people) {
        errorList.message.push("Insert size of group");
    }

    if(errorList.message.length > 0) {
        errorList.detail = "booked date, booked time and people must be included.";
        errorList.https_response.message = "Bad request";
        return res.status(400).json({ errorList });

    } 

    //Updating booking
    client.query(`UPDATE bookings
        SET message=$1, booked_date=$2, booked_time=$3, people=$4, confirmed=$5
        WHERE booking_num=$6`, [message, booked_date, booked_time, people, confirmed, bookingNr] , (err, result) => {
        if(err) {
                return res.status(500).json({error: "An error occurred updating booking: " + err});
        }
            
        //Inserting into handled_bookings
        client.query(`INSERT INTO handled_bookings (username, booking_num) VALUES ($1, $2) RETURNING *;`, [user, bookingNr], (err, result) => {
            if(err) {
                return res.status(500).json({error: "An error occurred inserting handled booking: " + err});
            } 

            const updatedBooking = result.rows;
            console.log(updatedBooking)
            res.status(200).json({ updatedBooking });
        });
    });
});


//Deleting bookings
router.delete("/bookings/:id", authenticateToken, (req, res) => {
    let bookingNr = req.params.id;

    client.query(`DELETE FROM handled_bookings WHERE booking_num=$1;`, [bookingNr], (err, results) => {
        if(err) {
            return res.status(400).json({ error: "An error occurred: " + err });
        }

        client.query(`DELETE FROM bookings WHERE booking_num=$1;`, [bookingNr], (err, results) => {
            if(err) {
                return res.status(400).json({ error: "An error occurred: " + err });
            }

            res.json({ message: "Booking deleted: " + bookingNr });
        });
    });
});


/* Tapas routing */
//Adding new tapas
router.post("/tapasmenu", authenticateToken, (req, res) => {
    const { name, description, price } = req.body;

    const errorList = {
        message: [],
        detail: "",
        https_resonse: {
        }
    };
    
    if(!name) {
        errorList.message.push("Insert name of tapas");
    }

    if(!description) {
        errorList.message.push("Insert description of tapas");
    }

    if(!price) {
        errorList.message.push("Insert price");
    }

    if(errorList.length > 0) {
        errorList.detail = "Name, description and price must be included.";
        errorList.https_resonse.message = "Bad request";
        return res.status(400).json({ errorList });

    }

    //Inserting into tapas
    client.query(`INSERT INTO tapas (name, description, price) VALUES ($1,$2,$3) RETURNING tapas_code;`, [name, description, price], (err, results) => {
        if(err) {
            return res.status(500).json({ error: "An error occurred: " + err });
        } 

        const tapasCode = results.rows[0].tapas_code;
        const user = req.username.username;

        //Inserting into edited_tapas
        client.query(`INSERT INTO edited_tapas (username, tapas_code) VALUES ($1, $2)`, [user, tapasCode], (err, results) => {
            if(err) {
                return res.status(500).json({ error: "An error occurred: " + err });
            }

            res.status(200).json({ message: "Tapas har lagts till. "});
        });
    });
});

//Editing tapas menu
router.put("/tapasmenu/:id", authenticateToken, (req, res) => {
    let tapasCode = req.params.id;
    let user = req.username.username;
    let { name, description, availability, price } = req.body;

    const errorList = {
        message: [],
        detail: "",
        https_resonse: {
        }
    };
    
    if(!name) {
        errorList.message.push("Insert name of tapas");
    }

    if(!description) {
        errorList.message.push("Insert description of tapas");
    }

    if(!price) {
        errorList.message.push("Insert price");
    }

    if(errorList.length > 0) {
        errorList.detail = "Name, description and price must be included.";
        errorList.https_resonse.message = "Bad request";
        return res.status(400).json({ errorList });

    }

    //Updating booking
    client.query(`UPDATE tapas
        SET name=$1, description=$2, availability=$3, price=$4 WHERE tapas_code=$5`, 
        [name, description, availability, price, tapasCode] , (err, result) => {
        if(err) {
            res.status(500).json({error: "An error occurred updating tapas: " + err});
        } else {
            
            //Inserting into handled_bookings
            client.query(`INSERT INTO edited_tapas (username, tapas_code) VALUES ($1, $2) RETURNING *;`, [user, tapasCode], (err, result) => {
                if(err) {
                    res.status(500).json({error: "An error occurred inserting edited tapas: " + err});
                } else {
                    const updatedTapas = result.rows;
                    res.status(200).json({ updatedTapas });
                }
            });
        }
    });
});

//Deleting tapas
router.delete("/tapasmenu/:id", authenticateToken, (req, res) => {
    let tapasCode = parseInt(req.params.id);

    client.query(`DELETE FROM edited_tapas WHERE tapas_code=$1;`, [tapasCode], (err, results) => {
        if(err) {
            return res.status(400).json({ error: "An error occurred: " + err });
        }
        
        client.query(`DELETE FROM tapas WHERE tapas_code=$1;`, [tapasCode], (err, results) => {
            if(err) {
                return res.status(400).json({ error: "An error occurred: " + err });
            }
        
            res.json({ message: "Tapas deleted: " + tapasCode });
        });
    });
});


/* Drinks routing */
//Adding new drinks
router.post("/drinkmenu", authenticateToken, (req, res) => {
    const { name, description, price } = req.body;

    const errorList = {
        message: [],
        detail: "",
        https_resonse: {
        }
    };
    
    if(!name) {
        errorList.message.push("Insert name of drink");
    }

    if(!description) {
        errorList.message.push("Insert description of drink");
    }

    if(!price) {
        errorList.message.push("Insert price");
    }

    if(errorList.length > 0) {
        errorList.detail = "Name, description and price must be included.";
        errorList.https_resonse.message = "Bad request";
        return res.status(400).json({ errorList });

    }

    //Inserting into tapas
    client.query(`INSERT INTO drinks (name, description, price) VALUES ($1,$2,$3) RETURNING drink_code;`, [name, description, price], (err, results) => {
        if(err) {
            res.status(500).json({ error: "An error occurred: " + err });
        } else {

            const drinkCode = results.rows[0].drink_code;
            const user = req.username.username;

            //Inserting into edited_drinks
            client.query(`INSERT INTO edited_drinks (username, drink_code) VALUES ($1, $2)`, [user, drinkCode], (err, results) => {
                if(err) {
                    return res.status(500).json({ error: "An error occurred: " + err });
                }

                res.status(200).json({ message: "Drinken har lagts till. "});
            })
        }
    });
});


//Editing drinks menu
router.put("/drinkmenu/:id", authenticateToken, (req, res) => {
    let drinkCode = req.params.id;
    let user = req.username.username;
    let { name, description, availability, price } = req.body;

    const errorList = {
        message: [],
        detail: "",
        https_resonse: {
        }
    };
    
    if(!name) {
        errorList.message.push("Insert name of drink");
    }

    if(!description) {
        errorList.message.push("Insert description of drink");
    }

    if(!price) {
       errorList.message.push("Insert price");
    }

    if(errorList.length > 0) {
        errorList.detail = "Name, description and price must be included.";
        errorList.https_resonse.message = "Bad request";
        return res.status(400).json({ errorList });

    }

    //Updating booking
    client.query(`UPDATE drinks
        SET name=$1, description=$2, availability=$3, price=$4 WHERE drink_code=$5`, 
        [name, description, availability, price, drinkCode] , (err, result) => {
        if(err) {
            return res.status(500).json({error: "An error occurred updating drink: " + err});
        } 
            
        //Inserting into handled_bookings
        client.query(`INSERT INTO edited_drinks (username, drink_code) VALUES ($1, $2) RETURNING *;`, [user, drinkCode], (err, result) => {
            if(err) {
                return res.status(500).json({error: "An error occurred inserting edited drink: " + err});
            } 
            const updatedDrink = result.rows;
            res.status(200).json({ updatedDrink });
        });
    });
});

//Deleting drinks
router.delete("/drinkmenu/:id", authenticateToken, (req, res) => {
    let drinkCode = req.params.id;

    client.query(`DELETE FROM edited_drinks WHERE drink_code=$1;`, [drinkCode], (err, results) => {
        if(err) {
            return res.status(400).json({ error: "An error occurred: " + err });
        } 
        
        client.query(`DELETE FROM drinks WHERE drink_code=$1;`, [drinkCode], (err, results) => {
            if(err) {
                return res.status(400).json({ error: "An error occurred: " + err });
            } 
            
            res.json({ message: "Drink deleted: " + drinkCode });
        });
    });
});


/* Reviews routing */
//Deleting reviews
router.delete("/reviews/:id", authenticateToken, (req, res) => {
    let reviewID = req.params.id;

    client.query(`DELETE FROM reviews WHERE message_id=$1;`, [reviewID], (err, results) => {
        if(err) {
            return res.status(400).json({ error: "An error occurred: " + err });
        } 
        
        res.json({ message: "Review deleted: " + reviewID });
    });
});

module.exports = router;