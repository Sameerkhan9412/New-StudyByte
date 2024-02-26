const mongoose=require("mongoose");
const ratingAndReviewSchema=new mongoose.Schema({
    user:{
        type:String,
        required:true,
        ref:"User"
    },
    rating:{
        type:Number,
        required:true,
    }
})

module.exports=mongoose.model("RatingAndReviews",ratingAndReviewSchema);