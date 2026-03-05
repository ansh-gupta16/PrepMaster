const express = require("express");
const router = express.Router();

const { evaluateCode } = require("../controllers/simulatorController");

router.post("/evaluate", evaluateCode);

module.exports = router;