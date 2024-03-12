const {instance}=require('../config/razorpay')
const Course=require('../models/Course')
const User=require("../models/User")

const mailSender=require('../utils/mailSender');
const {courseEnrollmentEmail}=require("../mail/templates/courseEnrollmentEmail")


// capture the payment and initiate the Razorpay order
exports.capturePayment=async(req,res)=>{
    // get courseId and userId
    const {courseId}=req.body;
    const userId=req.user.id;
    // validation
    // valid courseId
    if(!courseId){
        return res.status(400).json({
            success:false,
            message:"provide valid course Id"
        })
    }

    // valid course details
    let course;
    try {
        course=await Course.findById(courseId);
        if(!course){
            return res.status(400).json({
                success:false,
                message:'could not find the course'
            })
        }
        // user already pay for this same course
        const uid=new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:'Student is already enrolled'
            })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

    // order create 
    const amount=course.price;
    const currency="INR";
    const options={
        amount:amount*100,
        currency,
        reciept:Math.random(Date.now()).toString(),
        notes:{
            courseId:courseId,
            userId
        }
    }
    // return res
    try {
        // initiate the payment
        const paymentResponse=await instance.orders.create(options);
        console.log(paymentResponse);
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDecription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount
        })
    } catch (error) {
        console.error(error);
        return res.json({
            success:false,
            message:"could not initialize order"
        })
    }
}

// verify signature of razorpay and server
exports.verifySignature=async(req,res)=>{
    const webHookSecret="12345678";
    const signature=req.headers["x-razorpay-signature"];
    const shahsum=crypto.createHmac("sha256",webHookSecret);
    shahsum.update(JSON.stringify(req.body));
    const digest=shasum.digest("hex");
    if(signature===digest){
        console.log("Payment is authorised")
        const {courseId,userId}=req.body.payload.payment.entity.notes;
        try {
            // fullfill the action
            // find the course and enrolled in that course
            const enrolledCourse=await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{studentsEnrolled:userId}},
                {new:true}
            );
            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"Course not found"
                })
            }
            console.log(enrolledCourse);
            const enrolledStudent=await User.findOneAndUpdate(
                {_id:userId},
                {$push:{courses:courseId}},
                {new:true}
            );
            console.log(enrolledStudent);

            // send course confirmation mail
            const emailResponse=await mailSender(
                enrolledStudent.email,
                "Congretulations from StudyByte",
                "Congratultions,you are enrolled in the course"
            )
            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"Signature verified and course added",
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message
            })
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"invalid request"
        })
    }
}








