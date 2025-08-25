const Course =require("../models/Course");
const Tag = require("../models/Category");
const User =require("../models/User");
const {uploadImageToCloudinary}=require("../utils/imageUploader");

//createCourse handler function
exports.createCourse = async (req ,res) =>{
    try{
        const {coursename , courseDescription , whatYouWillLearn , price ,tag} = req.body;
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!coursename || !courseDescription || !whatYouWillLearn || !price || !tag){
            res.status(400).json({
                success:false,
                message:'All feilds are required',
            });
        }

        //check for istructor
        const userId =req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructoer Details:" ,instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor Details not found',
            });
        }

        //check give tag is valid or not
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor Details not found',
            });
        }
        //upload image top Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create an entry for new courses
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        })

        //add new course to the schema of Instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true},
        );

        //update the TAG ka schema

        return res.status(200).json({
            success:true,
            message:"Course Created successfully",
            data:newCourse,
        });
    }
    catch(error)
    {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create Course',
            error:error.message,
        })

    }
};

//getAllCourses handler function
exports.showAllCourses = async (req,res) =>{
    try{
        const allCourses = await Course.find({}, {courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true,})
            .populate("instructor")
            .exec();

        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully',
            data:allCourses,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Cannot Fetch course data',
            error:error.message,
        })
    }

}