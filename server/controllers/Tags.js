const Category=require("../models/Categories")
// create Category
exports.createCategory=async(req,res)=>{
    try {
        // fetch data
        const {name,description}=req.body;
        // validation
        if(!name||!description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        // create entry in db
        const CategoryDetails=await Category.create({
            name:name,
            description:description
        });
        console.log(CategoryDetails);
        return res.status(200).json({
            success:true,
            message:"Category created successfully"
        })
    } catch (error) {
     return res.status(500).json({
        success:false,
        message:error.message
     })   
    }
}

// getAllCategories
exports.getAllCategories=async(req,res)=>{
    try {
        const allCategories=await Category.find({},{name:true,description:true});
        res.status(200).json({
            success:true,
            message:"all Categories returned successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
         }) 
    }
}