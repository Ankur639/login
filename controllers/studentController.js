const firebase=require('../db');
const Student=require("../models/student");
const Joi = require('joi');
const bcrypt = require("bcryptjs");
const crypto =require("crypto");


const firestore=firebase.firestore();

const genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') 
            .slice(0,length);  
};


const sha512 = function(password, salt){
    const hash = crypto.createHmac('sha512', salt); 
    hash.update(password);
    const value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};


const addStudent =async(req,res,next)=>{
    
    try{
     const students=await firestore.collection('students');
     const data=await students.get();
     const studentsArray=[];
     let isExist=false;
     let email=req.body.email;
     let hashed_password;
     if(data.empty)
        {
            const  salt = genRandomString(16); /** Gives us salt of length 16 */
            const  {passwordHash} = sha512(req.body.password, salt);
            req.body.password=passwordHash;
            await firestore.collection('students').doc().set(req.body);   
            res.status(201).send("Record saved successfully");
        }
     else if(!data.empty)
     {
        data.forEach(doc=>{
             const student =new Student(
                 doc.data().email,
                 doc.data().password
             )
             studentsArray.push(student);

        })

       studentsArray.forEach(student=>{
            if(student.email===req.body.email)
             {
                 isExist=true;
             }

       })
      if(isExist)
        {
            res.status(200).send("Record exists");
        }
      else
      {
            const  salt = genRandomString(16); /** Gives us salt of length 16 */
            const  {passwordHash} = sha512(req.body.password, salt);
            req.body.password=passwordHash;
            await firestore.collection('students').doc().set(req.body);   
            res.status(201).send("Record saved successfully");
      }  
    }

   }
    catch(error)
    {
        res.status(400).send(error.message);
    }


}

module.exports={
    addStudent
}