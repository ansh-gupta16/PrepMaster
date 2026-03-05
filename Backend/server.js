require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// CONNECT DATABASE
connectDB();

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/assessments", require("./routes/assessmentRoutes"));
app.use("/api/simulator", require("./routes/simulatorRoutes"));

app.get("/", (req,res)=>{
  res.send("PrepMaster AI Running 🚀");
});

app.listen(5000,()=>console.log("Server running on 5000"));