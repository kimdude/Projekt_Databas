//Connecting to server
const cors = require("cors");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const client = require("./db/db");
const menuRoutes = require("./routes/menuRoutes");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

//Routing
app.get("/", (req, res) => {
    res.json( "Welcome to this API!" );
});

app.use("/api", authRoutes);
app.use("/api/menu", menuRoutes);

//Starting server
app.listen(process.env.PORT, () => {
    console.log("Connected to port: " + process.env.PORT);
});