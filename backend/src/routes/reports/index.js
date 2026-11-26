const express = require("express");
const categoryRouter = require("./categories.js");
const dailyRouter = require("./daily.js");
const monthlyRouter = require("./monthly.js");

const router = express.Router();

router.use("/categories", categoryRouter);
router.use("/daily", dailyRouter);
router.use("/monthly", monthlyRouter);

module.exports = router;
