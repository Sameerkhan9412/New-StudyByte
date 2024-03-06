const SubSection=require("../models/SubSection")
const Section=require("../models/Section")

// create subsection
exports.createSubSection=async(req,res)=>{
    try {
        // fetch data
        const {sectionId,title,timeDuration,description}=req.body;
        // extract video file
        const video=req.files.videofile;
        // validation
        if(!sectionId||!title||!timeDuration||!timeDuration){
            return res.status(400).json({
                success:false,
                message:"All field is required"
            })
        }
        // upload video to cloudinary
        const uploadDetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        // create subsection
        const SubSectionDetails=await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        // update section with this subsection
        const updatedSection=await Section.findByIdAndUpdate({_id:sectionId},
            {
                $push:{
                    subSection:SubSectionDetails._id,
                }
            },{new:true});
        // return res
        return res.status(200).json({
            success:true,
            message:"sub section created successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"internal server error",
            error:error.message
        })
    }
}

// update subsection
// delete subsection