const User = require('../models/user')
const Question = require('../models/question')
const Answer = require('../models/answer')

const handleGetFeaturedPost = async (req,res) => {
    try{
        const result = await Question.find({
            $and : [
                {"metadata.question_status" :  "Published" },
                {"metadata.hasRecommended" :  true }
            ]
        }).sort({ updatedAt: -1 }).limit(10)
        res.status(200).send({ 
            featuredQuestions : result
        })
    } catch(err) {
        console.log(err)
    }
}

const handleGetPopularToday = async (req,res) => {
    try{
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const result = await Question.find({
            $and :[
                {"metadata.question_status" :  "Published" },
                {updatedAt: { $gte: today } },
            ]
        }).sort({"metadata.no_of_upvotes": -1}).limit(10)
        res.status(200).send({ 
            popularToday : result
        })
    } catch(err) {
        console.log(err)
    }
}

const handleGetSimilarPost = async (req,res) => {
    const category = req.query.questionCategory
    
    try{
        const result = await Question.find({
            $and :[
                {"metadata.question_status" :  "Published" },
                {"metadata.category" : { $eq: category}},
            ]
        }).sort({updatedAt: -1}).limit(10)
        res.status(200).send({ 
            similarPost : result
        })
    } catch(err) {
        console.log(err)
    }
}

module.exports = {
    handleGetFeaturedPost,
    handleGetPopularToday,
    handleGetSimilarPost
}