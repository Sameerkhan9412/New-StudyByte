const User=require("../models/User")
const mailSender=require('../utils/mailSender')
const bcypt=require('bcrypt')


// reset password token
exports.resetPasswordToken=async(req,res)=>{
    try {
       // get email from req body
        const {email}=req.body;
        // check user for this email , email validation
        const user=await User.findOne({email:email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Your email is not registered with us"
            })
        }
        // generate token
        const token=crypto.randomUUID();
        // update user by adding token and expiration time
        const updatedDetails=await User.findOneAndUpdate({email:email},{
            token:token,resetPasswordExpires:Data.now()+5*60*1000,
        },{new:true})
        // create url 
        const url=`http://localhost:3000/update-password/${token}`
        // send mail containing the url
        await mailSender(email,"Password Reset Link",`password reset link url=${url}`)
        // return response
        return res.status(200).json({
            success:true,
            message:`Email send successfully, please check email and change password`
        }) 
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"something went wrong while sending reset password mail"
        })
        
    }
    
}

// reset password

exports.resetPassword=async(req,res)=>{
    try {
        // fetch daata
        const {password,confirmPassword,token}=req.body;
        // validation
        if(password!==confirmPassword){
            return res.json({
                success:false,
                message:'Password not matching'
            })
        }
        // get userdetails from db using token
        const userDetails= await User.findOne({token:token});
        // if no entry -> invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:"token is invalid"
            })
        }
        // token time check
        if(userDetails.resetPasswordExpires<Data.now()){
            return res.json({
                success:false,
                message:'token is expired , please regenrate your token '
            })
        }
        // hash pwd
        const hashedPassword=await bcypt.hash(password,10);
        // password update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true}
        )
        // return respnse
        res.status(200).json({
            success:true,
            message:"Password reset successful"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"something went wrong while reset password"
        })
       
    }
}