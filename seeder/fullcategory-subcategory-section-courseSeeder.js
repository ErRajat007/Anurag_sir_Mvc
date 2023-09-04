const UserModel = require('../models/user');
const CategoryModel = require('../models/category');
const SubCategoryModel = require('../models/subCategeory');
const CourseReviewRatingModel = require('../models/rating&review');
const SectionModel = require('../models/subCategorySections');
const CourseModel = require('../models/course');
;
const bcrypt = require('bcrypt');
// const faker = require('faker');
const mongoose = require('mongoose');

const URL = "mongodb://localhost:27017/E-learning";

mongoose.connect( URL , { useNewUrlParser : true, useUnifiedTopology : true } , () => {
    console.log("Mongoose Connected");
    
    let categories = ['development','business','finance & accounting','IT & software']
    let Sub = [['web development','datascience','mobile development','programming languages'],['entrepreneurship','communication','management','sales'],
    ['accounting & book keeping','compliance','cryptocurrency & blockchain','economics'],
    ['IT certification','network & security','hardware','operating system & servers']]
    let sec = [[['javascript','angular','react','css'],['python','machine learning','deep learning','data analysis'],
    ['google flutter','android development','ios development','react native'], ['python','java','c#','react']],
    [['business fundamental','entrepreneurship fundamental','business strategy','startup'],
     ['communication skill','presentation skill','writing','public speaking'],
     ['product management','leadership','business strategy','management skill'],
     ['sales skill','b2b sales','linkedin','presentation skill']

    ],
[['accounting','book keeping','financial accounting','finance fundamentals'],
['anti-money laundering','risk management','sarbanes-oxley','cams certification'],
['cryptocurrency','blockchain','bitcoin','day trading'],
['microeconomics','stata','macroeconomics','finance fundamentals']],
[['aws certification','microsoftcertification','amazon aws','cysco CCNA'],
['ethical hacking','cyber security','network security','terraform'],
['plc','arduino','microcontroller','electronics'],
['linux','linux administration','windows server','active directory']

]

]
let imagePath = 'http://54.226.75.2:3000/1628227728630-blank-profile-picture-circle-hd.png'
let videoPath ='http://54.226.75.2:3000/1628227728630-file_example_MP4_1280_10MG.mp4'
 let c = 0;

(async () => {

    for(let i = 0; i < categories.length; i++) {
            
                  let Category = await new CategoryModel({
                    categoryName: categories[i],
                        
                    });
                    let saveCategory =  await Category.save()
                        
                       
                            for(let j = 0; j < Sub[i].length; j++) {
                    
                                let SubCategory = await new SubCategoryModel({
                                    categoryId : saveCategory._id, 
                                    subCategoryName : Sub[i][j]
                                      
                                  });
                                  let saveSubCategory =  await SubCategory.save()
                                      
                                      
                                        for(let k = 0; k < sec[i][j].length; k++) {
                    
                                            let Section = await new SectionModel({
                                                categoryId : saveSubCategory.categoryId, 
                                                 subCategoryId : saveSubCategory._id, 
                                                 sectionName : sec[i][j][k]
                                                  
                                              });
                                              let saveSection =  await Section.save()
                                                  
                                                    console.log('a')
                                                    let User = await UserModel.find()
                                                        console.log(User[i]._id)
                                                            let Course = await new CourseModel({
                                                                categoryId : saveSection.categoryId, 
                                                                subCategoryId : saveSection.subCategoryId,
                                                                sectionId : saveSection._id, 
                                                                title : `title${c}`,
                                                                
                                                                description : `description${c}`,
                                                                imageFile: imagePath,
                                                                videoFile: videoPath,
                                                                price : 400+c,
                                                                createdBy:  User[i]._id,
                                                                
                                                                
                                                                  
                                                              });
                                                              let saveCourse =  await Course.save()
                                                                 
                                                                c++
                                                                    if(c == 64){
                                                                        console.log(`seeded successfully${c}`)
                
                                                                    }
                                                                    
                                                                
                }
                    }
                    
                }
                
              
})
 ()
})

