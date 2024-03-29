const Profile=require('../models/Profile')
const User=require('../models/User')
exports.updateProfile=async(req,res)=>{
    try {
        // get data
        const {dateOfBirth="",about="",contactNumber,gender}=req.body;
        // get userid
        const id=req.user.id;
        // validation
        if(!contactNumber||!gender||!id){
            return res.status(400).json({
                success:false,
                message:"All fields required"
            })
        }
        // find profile
        const userDetails=await User.findById(id);
        const profileId=userDetails.additionalDetails;
        const profileDetails=await Profile.findById(profileId);

        // update profile
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender=gender;
        profileDetails.contactNumber=contactNumber;
        await profileDetails.save();
        return res.status(200).json({
            success:true,
            message:"profile updated successfullly",
            profileDetails
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"something went wrong",
            error:error.message
        })
    }
}

// delete account
exports.deleteAccount=async(req,res)=>{
    try {
        // get id
        const id=req.user.id;
        // validation
        const userDetails=await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
        // delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        // delete user
        await User.findByIdAndDelete({_id:id})
        return res.status(200).json({
            success:false,
            message:"User Deleted Successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User cannot be deleted successfully"
        })
    }
}

// explore -> how can we schedule this deletion operation


exports.getAllUserDetails=async(req,res)=>{
    try {
        const id=req.user.id;
        const userDetails=await User.findById(id).populate("additionalDetails").exec();
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success:true,
            message:error.message
        })
    }
}


exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};


