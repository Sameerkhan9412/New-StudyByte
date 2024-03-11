const RatingAndReviews=require("../models/RatingAndReviews")
const Course=require("../models/Course");
const { default: mongoose } = require("mongoose");

// create rating
exports.createRating=async(req,res)=>{
    try {
        // get userid
        const userId=req.user.id;
        // fetch data from req.body
        const {rating,review,courseId}=req.body;
        // check if user is already enrolled or not
        const courseDetails=await Course.findOne(
            {_id:courseId,studentsEnrolled:{$elemMatch : {$eq:userId}}}
        )
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"Student is not enrolled in the course  "
            })
        }
        // check if user already reviewd the course
        const alreadyReviewed=await RatingAndReview.findOne({
            user:userId,
            course:courseId
        });
        if(alreadyReviewed){
            return res.status(400).json({
                success:false,
                message:"Course is already reviews"
            })
        }
        // creating rating reviews
        const ratingReivew=await RatingAndReviews.create({_id:courseId},
            {
                $push:{
                    RatingAndReviews:ratingReivew._id,
                }
            },{new:true})
        // update course with this rating
        const updatedCourseDetails=await Course.findByIdAndUpdate({_id:courseId},
            {
                $push:{
                    ratingAndReviews:ratingReivew._id,
                }
            },{new:true})

        return res.status(200).json({
            success:true,
            message:"Rating and review created successfully",
            ratingReivew
        })

        // return Response
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// get average rating
exports.getAverageRating=async(req,res)=>{
    try {
        const courseId=req.body.courseId;
        const result=await ratingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"},
                }
            }
        ])
        if(result.length>0){
            return res.status(200).json({
                success:false,
                averageRating:result[0].averageRating,
            })
        }
        // if no rating review exist
        return res.status(200).json({
            success:true,
            message:"Average Rating is 0 , no rating given till now",
            averageRating:0
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// getting all reviews
exports.getAllReviews=async(req,res)=>{
    try {
        const allReviews=await RatingAndReview.find({})
        .sort({rating:"desc"})
        .populate({
            path:"user",
            Select:"firstName lastName email image",
        })
        .populate({
            path:"Course",
            select:"courseName"
        })
        .exec();
        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data:allReviews
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


















