const mongoose = require('mongoose');

const URL = "mongodb://localhost:27017/E-learning";

mongoose.connect( URL , { useNewUrlParser : true, useUnifiedTopology : true ,useFindAndModify : false } , () => {
    console.log("Mongoose Connected");
})