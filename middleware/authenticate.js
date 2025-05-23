const jwt = require("jsonwebtoken");
require("dotenv").config();

//Authentication
function authenticateToken(req, res, next) {

    //Checking authentication header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    //Missing token
    if(token === null) {
        res.status(401).json({ message: "Not authorized for this route - token missing. "});
    }

    //Verifying token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, username) => {
        if(err) {
            return res.status(403).json({ message: "Invalid JWT" });
        }

        req.username = username;

        next();
    })
}

module.exports = authenticateToken;