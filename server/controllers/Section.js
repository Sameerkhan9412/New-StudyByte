const Section=require("../models/Section")
const Course=require("../models/Course")
exports.createSection=async(req,res)=>{
    try {
        // fetch date
        const {sectionName,courseId}=req.body;
        // data validation
        if(!sectionName||!courseId){
            return res.status(400).json({
                success:false,
                message:"missing properties",
            })
        }
        // create section
        const newSection=await Section.create({sectionName});
        // update course
        const updateCourseDetails=await Course.findByIdAndUpdate(
            courseId,{
                $push:{
                    courseContent:newSection._id,
                }
            },{
                new:true,
            }
        );
        // use populate to replace section /subsection both in the updated course details
        // return res
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updateCourseDetails
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to create section , please try again",
            error:error.message
        })
    }
}

exports.updateSection=async(req,res)=>{
    try {
        const {sectionName,sectionId}=req.body;
        if(!sectionId||!sectionName){
            return res.status(400).json({
                success:false,
                message:"missing properties",
            })
        }
        const section=await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to update section ,please try again"
        })
    }
}

exports.deleteSection=async(req,res)=>{
    try {
        const {sectionId}=req.params;
        await Section.findByIdAndDelete(sectionId)
        // do we need to delete the entry from the coure section-> do in tesing
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to delete section ,please try again"
        })
    }
}








