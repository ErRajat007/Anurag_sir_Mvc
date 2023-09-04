const express = require("express");
const authRouter = require('../routes/authRoutes');
const adminRouter = require('../routes/adminRoutes')
const commonRouter = require('../routes/commonRoutes')
const userRouter = require('../routes/userRouter')
//const adminRouter = require("./admin");


const app = express(); 

app.use("/auth/", authRouter);
app.use("/admin/", adminRouter);
app.use("/common/",commonRouter);
app.use("/user/",userRouter);

module.exports = app;