const User = require('../models/user')
const Question = require('../models/question')
const Answer = require('../models/answer')
const Comment = require('../models/comment')

const handleCreateComment = async (req,res) => {
    const {
        user_id,
        comment,
        question_id,
        answer_id
    } = req.body

    try{
        const response = await User.find({user_id})
            if (response.length === 0)  {
                res.status(404).send("User Not Found") 
                return
            } 
        const response2 = await Answer.findById({ _id: answer_id })
            if (!response2)  {
                res.status(404).send("Answer Not Found") 
                return
            } 
        const currComment = {
            question_id,
            answer_id,
            comment,
            createdBy: user_id,
            status: "live"
        }
        const newData = new Comment(currComment)
        const commentObject = await newData.save()
        if(commentObject) {
            console.log(commentObject._id)
            const ansResult = await Answer.findByIdAndUpdate({_id: answer_id}, {
                $push : {
                    comment_id : commentObject._id,
                },
                $inc : {
                    "metadata.no_of_comments" : 1
                }
            }, {useFindAndModify: false})

            const quesResult = await Question.findByIdAndUpdate({_id: question_id}, {
                $inc : {
                    "metadata.no_of_comments" : 1
                }
            }, {useFindAndModify: false})

            if(quesResult && ansResult) {
                res.status(201).send("comment saved")
            }
        }
    
    } catch(err) {
        console.log(err)
        res.status(404).send("Error -> " + err)
    }
}

const handleGetComment = async (req,res) => {
    const answer_id = req.query.answerID
    const filter_type = req.query.sortType
    const page_number = req.query.pageNumber

    try{
        const response = await Answer.findById({_id: answer_id})
        if (!response)  {
            res.status(404).send("Answer Not Found") 
            return
        } 
        if( filter_type === 'latest'){
            const result = await Comment.find({
                $and: [
                    {answer_id : answer_id},
                    {status : "live"}
                ]
            }).sort({createdAt: -1}).skip((page_number-1)*3).limit(3)
            console.log(result.length)
            res.status(200).send({ comments : result})
        }
        if( filter_type === 'oldest'){
            const result = await Comment.find({
                $and: [
                    {answer_id : answer_id},
                    {status : "live"}
                ]
            }).sort({createdAt: 1}).skip((page_number-1)*3).limit(3)
            console.log(result.length)
            res.status(200).send({ comments : result})
        }
        
    } catch (err) {
        console.log(err)
        res.status(404).send("Error ->" + err)
    }
}

const handleDeleteComment = async (req,res) => {
    const {
        user_id,
        comment_id,
        question_id,
        answer_id
    } = req.body

    try{
        const response = await Comment.findOneAndUpdate(
            { $and: [
                { _id: {$eq:comment_id }},
                { createdBy : { $eq: user_id}}
            ]} ,
            {
                $set: {status: "Deleted"}               
            },
            {returnOriginal: false}
        )
        if(!response) res.status(404).send('User or comment mismatch ')
        if(response) {
            const quesResult = await Question.findByIdAndUpdate({_id: question_id},{
                $inc : {
                    "metadata.no_of_comments" : -1
                }
            },  {useFindAndModify: false})
            console.log("Answer Result=> "+ quesResult)
            const ansResult = await Answer.findByIdAndUpdate({_id: answer_id},{
                $pull : {
                    comment_id : comment_id,
                },
                $inc : {
                    "metadata.no_of_comments" : -1
                }
            })
            if(quesResult && ansResult) {
                res.status(201).send("Comment deleted")
                return
            }
        }
    } catch (err) {
        console.log(err)
        res.status(404).send("Error ->" + err)
    }
}

module.exports = {
    handleCreateComment,
    handleDeleteComment,
    handleGetComment
}