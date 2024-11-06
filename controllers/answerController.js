const User = require('../models/user')
const Question = require('../models/question')
const Answer = require('../models/answer')

const handleCreateAnswer = async (req,res) => {
    const {
        user_id,
        question_id,
        answer
    } = req.body

    try{
        const response = await User.find({user_id})
            if (response.length === 0)  {
                res.status(404).send("User Not Found") 
                return
            } 
        const response2 = await Question.findById({_id: question_id})
        if (!response2)  {
            res.status(404).send("Question Not Found") 
            return
        } 

        const currAnswer = {
            question_id,
            answer,
            comment_id:[],
            metadata: {
                no_of_comments:0,
                no_of_upvotes:0,
                createdBy: user_id,
                modifiedBy:"",
                isDuplicate: false,
                isEdited: false,
                answer_type: "Original",
                answer_status : "Published",
                isTopAnswer: false,
                isRecommended: false, 
            }
        }
        const newData = new Answer(currAnswer)
        const answerObject = await newData.save()
        if(answerObject) {
            console.log(answerObject._id)
            const result = await Question.findByIdAndUpdate({_id: question_id},{
                $push : {
                    answer_id : answerObject._id,
                },
                $inc : {
                    "metadata.no_of_answers" : 1
                }
            },  {useFindAndModify: false})
            console.log("Result=>"+result)
            if(result) {
                res.status(201).send("answer saved")
            }
        } 
    } catch(err) {
        console.log(err)
        res.status(404).send("Error -> " + err)
    }
}

const handleGetAnswer = async (req,res) => {
    const question_id = req.query.questionID
    const filter_type = req.query.sortType
    const page_number = req.query.pageNumber

    try{
        const response = await Question.findById({_id: question_id})
        if (!response)  {
            res.status(404).send("Question Not Found") 
            return
        } 
        
        if( filter_type === 'newest'){
            const result = await Answer.find({
                $and: [
                    {question_id : question_id},
                    {"metadata.answer_status" : "Published"}
                ]
            }).sort({createdAt: -1}).skip((page_number-1)*10).limit(10)
            console.log(result.length)
            res.status(200).send({ answers : result})
            return
        }
        if( filter_type === 'oldest'){
            const result = await Answer.find({
                $and: [
                    {question_id : question_id},
                    {"metadata.answer_status" : "Published"}
                ]
            }).sort({createdAt: 1}).skip((page_number-1)*10).limit(10)
            console.log(result.length)
            res.status(200).send({ answers : result})
            return
        }
        if( filter_type === 'popular'){
            const result = await Answer.find({
                $and: [
                    {question_id : question_id},
                    {"metadata.answer_status" : "Published"}
                ]
            }).sort({"metadata.no_of_comments": -1}).skip((page_number-1)*10).limit(10)
            console.log(result.length)
            res.status(200).send({ answers : result})
            return
        }
        if( filter_type === 'most liked'){
            const result = await Answer.find({
                $and: [
                    {question_id : question_id},
                    {"metadata.answer_status" : "Published"}
                ]
            }).sort({"metadata.no_of_upvotes": -1}).skip((page_number-1)*10).limit(10)
            console.log(result.length)
            res.status(200).send({ answers : result})
            return
        }
        
    } catch (err) {
        console.log(err)
        res.status(404).send("Error ->" + err)
    }
}

const handleEditAnswer = async (req,res) => {
    const {
        user_id,
        answer_id,
        answer
    } = req.body

    try{
        const response = await Answer.find({
            $and: [
                { _id: {$eq:answer_id }},
                { "metadata.createdBy" : { $eq: user_id}}
            ]
        } )
        console.log(response)
        const questionID = response[0].question_id;
        //const questionID = response
        if (response.length === 0)  {
            res.status(404).send("User or answer not Found") 
            return
        }

        const result = await Answer.findByIdAndUpdate({_id:answer_id},{
            $set : {
                answer,
                "metadata.modifiedBy" : user_id,
                "metadata.isEdited" : true,
                "metadata.isTopAnswer" : false
            }
        },{useFindAndModify: false})

        await Question.findByIdAndUpdate({_id: questionID},{
            $set : {
                "metadata.topAnswerID" : ""
            }
        },{useFindAndModify: false})

        console.log(result)
        if(result) res.status(200).send("OK")
    } catch (err) {
        console.log(err)
    }
}

const handleDeleteAnswer = async (req,res) => {
    const user_id = req.query.user_id;
    const answer_id = req.query.answer_id;
    const question_id = req.query.question_id;

    try{

            const response = await Answer.findOneAndUpdate(
                { $and: [
                    { _id: {$eq:answer_id }},
                    { "metadata.createdBy" : { $eq: user_id}}
                ]} ,
                {
                    $set:{"metadata.answer_status": "Deleted"}
                },
                {returnOriginal: false}
            )
            if (response.length === 0)  {
                res.status(404).send("User or answer not Found") 
                return
            } 
            if(response) {
                const result = await Question.findByIdAndUpdate({_id: question_id},{
                    $pull : {
                        answer_id : answer_id,
                    },
                    $inc : {
                        "metadata.no_of_answers" : -1
                    }
                },  {useFindAndModify: false})
                console.log("Result=>"+result)
                if(result) {
                    res.status(201).send("answer deleted")
                    return
                }
            }
        
    } catch (err) {
        console.log(err)
    }
}

const handleCreateTopAnswer = async (req,res) => {
    const {
        questionOwnerID,
        answer_id,
        question_id
    } = req.body

    try{
        const response = await Question.findOneAndUpdate({
            $and: [
                { _id: {$eq:question_id }},
                { "metadata.createdBy" : { $eq: questionOwnerID}}
            ]},
            {
                $set: {"metadata.topAnswerID": answer_id}
            },
            {returnOriginal: false} )
        console.log(response)
        if (response.length === 0)  {
            res.status(404).send("User not found") 
            return
        }
        const result = await Answer.findByIdAndUpdate({_id: answer_id},{
            $set : {
                "metadata.isTopAnswer" : true
            }
        })
        if(result) res.status(201).send("Top answered marked")
} catch (err) {
        console.log(err)
        res.status(404).send("Error ->" + err)
    }
}

const handleGetTopAnswer = async (req,res) => {
    const { question_id } = req.body

    try{
        const response = await Answer.findById({_id: question_id})
        console.log(response)
        if(response.length === 0) {
            res.status(404).send("Question not found");
            return
        }
        const topAnswerID = response.metadata.topAnswerID;

        const result = await Answer.findById({_id: topAnswerID})
        console.log(result)
        if(!result) {
            res.status(404).send("Top answer not found")
            return
        }
        res.status(200).send({ topAnswer: result})
    } catch (err) {
        console.log(err)
        res.status(404).send("Error ->" + err)
    }
}

const handleAnswertUpvote = async (req,res) => {
    const answer_id = req.query.answerID;

    try{
        const response = await Answer.findByIdAndUpdate({_id:answer_id},
            {
                $inc : {
                    "metadata.no_of_upvotes" : 1
                }
            }, {useFindAndModify: false} )

        console.log(response)
        if(!response) res.status(404).send("User Not Found")
        else res.status(201).send("upVoted!")
    } catch (err) {
        console.log(err)
    }
}

const handleRecommendedAnswer = async (req,res) => {
    const answer_id = req.query.answerID;
    const question_id = req.query.questionID

    try{
        const response = await Answer.findByIdAndUpdate({_id:answer_id},
            {
                $set : {
                    "metadata.isRecommended" : true
                }
            }, {useFindAndModify: false} )
        
        await Question.findByIdAndUpdate({_id:question_id},
            {
                $set : {
                    "metadata.hasRecommended" : true
                }
            }, {useFindAndModify: false} )
        

        console.log(response)
        if(!response) res.status(404).send("User Not Found")
        else res.status(201).send("Recomended")
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    handleGetAnswer,
    handleCreateAnswer,
    handleEditAnswer,
    handleDeleteAnswer,
    handleCreateTopAnswer,
    handleGetTopAnswer,
    handleAnswertUpvote,
    handleRecommendedAnswer
}