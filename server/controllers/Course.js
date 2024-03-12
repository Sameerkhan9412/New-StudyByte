const Course=require("../models/Course")
const Tag=require("../models/Category")
const User=require("../models/User")
const {uploadImageToCloudinary}=require("../utils/imageUploader")

// create course handler
exports.createCourse=async(req,res)=>{
    try {
        // fetch data
        const {courseName,courseDescription,whatYouWillLearn,price,tag}=req.body;
        // get thumbnail
        const thumbnail=req.files.thumbnailImage;
        // validation
        if(!courseName||!courseDescription||!whatYouWillLearn||!price||!tag||!thumbnail){
            return res.status(400).json({
                success:false,
                message:"all fields are required"
            })
        }
        // check for instructor
        const userId=req.user.id;
        const instructorDetails=await User.findById({userId});
        console.log("Instructor Details:",instructorDetails)
        if(!instructorDetails){
            res.status(404).json({
                success:false,
                message:'Instructor Details not found'
            })
        }
        // check given tag is valid or not
        const tagDetails=await Tag.findById(tag);
        if(!tagDetails){
            res.status(404).json({
                success:false,
                message:"Tag details not found"
            });
        }

        // upload image to cloudinary
        const thumbnailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
        // create an entry for new course
        const newCourse=await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url
        })

        // add the new coure to the user schema of Instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true},
        )

        // update tag schema
        // pending
        // return response
        return res.status(200).json({
            success:true,
            message:"Course created successfully",
            data:newCourse
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"failed to create course",
            error:error.message
        })
    }
}

// get all course 
exports.showAllCourses=async(req,res)=>{
    try {
        const allCourses=await Course.find({});
        return res.status(200).json({
            success:true,
            message:"Data for all course fetched successfully",
            data:allCourses,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"failed to fetch course",
            error:error.message
        })
    }
}

exports.getAllCourses = async (req, res) => {
	try {
		const allCourses = await Course.find(
			{},
			{
				courseName: true,
				price: true,
				thumbnail: true,
				instructor: true,
				ratingAndReviews: true,
				studentsEnroled: true,
			}
		)
			.populate("instructor")
			.exec();
		return res.status(200).json({
			success: true,
			data: allCourses,
		});
	} catch (error) {
		console.log(error);
		return res.status(404).json({
			success: false,
			message: `Can't Fetch Course Data`,
			error: error.message,
		});
	}
};


// get course details
exports.getCourseDetails=async(req,res)=>{
    try {
        const {courseId}=req.body;
        const courseDetails=await Course.find(
            {_id:courseId},
        ).populate(
            {
                path:"instructor",
                populate:{
                    path:"additionalDetails"
                }
            }
        )
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            },
        })
        .exec();
        // validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`could not find the course with ${courseId}`,
            });
        }
        return res.status(200).json({
            success:true,
            message:"Course details fetched successfully",
            data:courseDetails
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

