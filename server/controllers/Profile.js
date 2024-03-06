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
exports.deleteAcount=async(req,res)=>{
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


