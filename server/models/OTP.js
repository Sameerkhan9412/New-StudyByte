const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");
const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60
    }
})

OTPSchema.pre("save",async(next)=>{
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports=mongoose.model("OTP",OTPSchema);

// a function to send email
const sendVerificationEmail=async(email,otp)=>{
    try {
        const mailResponse=await mailSender(email,"Verification Email from StudyByte",otp);
        console.log("Email send successfully",mailResponse);
    } catch (error) {
        console.log("Error occur while sending mail",error);
        throw error;
    }
}





