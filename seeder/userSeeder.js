const UserModel = require('../models/user');
;
const bcrypt = require('bcrypt');
// const faker = require('faker');
const mongoose = require('mongoose');

const URL = "mongodb://localhost:27017/E-learning";

mongoose.connect( URL , { useNewUrlParser : true, useUnifiedTopology : true } , () => {
    console.log("Mongoose Connected");
    
    let password = "123456"
    let fullName = "user"
    let role = "User"  
    let count = 0;
    let num_records = 100;

    (async () => {
        for(let i = 0; i < num_records; i++) {
            
    
          let pass =   await bcrypt.hash(password, 10)
          let userData = await new UserModel({
                fullName: `${fullName}${i+1}`,
                email: `${fullName}${i+1}@gmail.com`,
                password: pass,
                role: role,
            });
            let saveUserData =  await userData.save(async function (err, result) {
                
                if (err) {
                    return console.log(err)
                } else {
                    count++;
                    
                    if(count >= num_records) {
                      mongoose.connection.close();
                      console.log("Database Seeded");
                    }
                    
                }
            }
            )
            
        }
        
      })();
})

