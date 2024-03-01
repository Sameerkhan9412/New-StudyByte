const User=require("../models/User");
const OTP=require("../models/OTP");
const otpGenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require('jsonwebtoken')
require('dotenv').config();
// sendotp
exports.sendOTP=async(req,res)=>{
    try {
        // fetch email
        const {email}=req.body;
        // check user is alreay exist or not
        const  checkUserPresent=await User.findOne({email});
        // if user is exist then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User is already registered",
            })
        }

        // generate OTP
        var otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated:",otp);
        
        // check unique otp or not
        const result=await OTP.find({otp:otp});
        while(result){
            otp=otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result=await OTP.find({otp:otp});
        }

        const payload={email,otp};
        // create entry in DB for OTP
        const otpBody=await OTP.create(payload);
        console.log(otpBody);

        // return response successful
        res.status(200).json({
            success:true,
            message:'OTP send successfully',
            otp
        })


    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success:false,
            message:error.message,
        })
        
    }
    
}

// signup
exports.signup=async(req,res)=>{

    // data fetch for req.body
    const {firstName,lastName,email,password,confirmPassword}=req.body;

    // validation
    if(!firstName||!lastName||!email||!password||!confirmPassword||!accountType||!contactNo||!otp){
        return res.status(403).json({
            success:false,
            message:"all fields are required"
        })
    }

    // match password
    if(password!==confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Password and Confirm password value does not match, please try again"
        })
    }

    // check user already exist or not
    const existingUser=await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:'User is already registered'
        })
    }

    // find most recent otp stored for the user
    const recentOTP=await OTP.find({email}).sort({createdAt:-1}).limit(1);
    console.log(recentOTP);

    // validate otp
    if(recentOTP.length==0){
        // OTP not found
        return res.status(400).json({
            success:false,
            message:"OTP not found"
        })
    }else if(otp!==recentOTP.otp){
        // invalid otp
        return res.status(400).json({
            success:false,
            massage:"invalid otp"
        });

    }

    // hash password
    const hashedPassword=await bcrypt.hash(password,10);

    const profileDatails=await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    })

    // entery create in db
    const user=await User.create({
        firstName,lastName,email,contactNo,password:hashedPassword,accountType,additionalDetails:profileDatails._id,image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    })

    // return res
    return res.status(200).json({
        success:false,
        message:"User is registered successfully"
    })
}

// login
exports.login=async(req,res)=>{
    try {
        // get data from req.body
        const {email,password}=req.body;
        // validation
        if(!email||!password){
            return res.status(403).json({
                success:false,
                message:"All field are required,please try again",
            })
        }
        // user check exist or not
        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered,please signup first"
            })
        }
        // generate JWT,after password matched
        if(await bcrypt.compare(password,user.password)){
            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType
            }
            const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'2h'})
            user.token=token;
            user.password=undefined;
            // create cookie and send response
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged In Successfully"
            })
        }else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect"
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"login failure"
        })
    }
}




// change Password
exports.changePassword=async(req,res)=>{
    // get data from req.body
    // get old password  and new password and confirm password
    // validation

    // update password in DB
    // send mail - password updated
    // return res
}