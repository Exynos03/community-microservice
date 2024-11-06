const User = require('../models/user')
const Question = require('../models/question')
const Tag = require('../models/tag')
const Category = require('../models/category')
const Topic = require('../models/topic')

const handleCreateQuestion = async (req,res) => {
    const { 
        user_id,
        question,
        question_sub_text,
        category,
        topic,
        tag 
    } = req.body

    const relatedTo = [...tag,category,topic]

    try{
        const response = await User.find({user_id})
        if (response.length === 0)  {
            res.status(400).send("User Not Found") 
            return
        }
        const currAnswer = {
            question,
            question_sub_text,
            answer_id:[],
            metadata:{
                no_of_views:0,
                no_of_answers:0,
                no_of_comments:0,
                no_of_upvotes:0,
                createdBy:user_id,
                modifiedBy:"",
                category, //array of strings
                topic,
                relatedTo: relatedTo,
                isDuplicate: false,
                isEdited: false,
                question_type: "Original",
                question_status:"Published",
                topAnswerID: "",
                hasRecommended: false
            }
        }
        const newData = new Question(currAnswer)
        const result = await newData.save()
        const catRes = await Category.find({ category: { $in: [category]} })
        const topicRes = await Topic.find({ topic: { $in: [topic]}})
        if(catRes.length === 0) {
            await Category.findByIdAndUpdate({_id:'64b5342fd268e9236c39cd87'},{
                $push : {
                    category : category
                }
            }, {useFindAndModify: false})
        }
        if(topicRes.length === 0) {
            await Topic.findByIdAndUpdate({_id:'64b535ce8d67e61a07e1d9a8'},{
                $push : {
                    topic : topic
                }
            }, {useFindAndModify: false})
        }
        for(let i=0 ; i<relatedTo.length ; i++) {
            const res = await Tag.find({ tag: { $in: [relatedTo[i]]}})
            if(res.length === 0) {
                await Tag.findByIdAndUpdate({_id:'64b535a1efe51181a764c84a'},{
                    $push : {
                        tag : relatedTo[i]
                    }
                }, {useFindAndModify: false})
            }
        }
        if(result) {
            res.status(201).send("Question Saved!")
            console.log(result)
        }
    } catch(err) {
        res.status(400).send("Error ->" + err)
        console.log(err)
    }
}

const handleGetQuestionForLandingPage = async (req,res) => { 
    const page_number = req.query.pageNumber

    try{
        const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
        const result = await Question.find({"metadata.question_status" : "Published"}).sort({ updatedAt: -1 }).skip( (page_number-1)*12 ).limit(12)
        res.status(200).send({ 
            totalQuestionCount: docCount,
            questions : result
        })
    } catch(err) {
        console.log(err)
    }
} 

const handleGetQuestion = async (req,res) => {
    const sort_type = req.query.sortType
    const page_number = req.query.pageNumber
    const tag1 = req.query.tag1
    const tag2 = req.query.tag2
    const tag3 = req.query.tag3
    
    try{
        if( tag1 && tag2 && tag3) {
            if(sort_type === 'hot') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const allTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $all: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_views": -1})
    
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({"metadata.no_of_views": -1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_views": -1})

                const resultArray = [...allTagRes,...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }

            if(sort_type === 'popular') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const allTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $all: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_answers": -1})
    
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({"metadata.no_of_answers": -1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_answers": -1})

                const resultArray = [...allTagRes,...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }
            
            if(sort_type === 'newest') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const allTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $all: [tag1,tag2,tag3]}}
                    ]
                }).sort({createdAt: -1})
    
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({createdAt: -1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({createdAt: -1})

                const resultArray = [...allTagRes,...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }

            
            if(sort_type === 'oldest') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const allTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $all: [tag1,tag2,tag3]}}
                    ]
                }).sort({createdAt: 1})
    
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({createdAt: 1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({createdAt: 1})

                const resultArray = [...allTagRes,...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }

            if(sort_type === 'most liked') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const allTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $all: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_upvotes": -1})
    
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({"metadata.no_of_upvotes": -1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_upvotes": -1})

                const resultArray = [...allTagRes,...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }

            if(sort_type === 'unanswered') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const allTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $all: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_answers": -1})
    
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({"metadata.no_of_answers": -1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_answers": -1})

                const resultArray = [...allTagRes,...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }
            else {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const allTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $all: [tag1,tag2,tag3]}}
                    ]
                }).sort({createdAt: -1})
    
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({createdAt: -1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({createdAt: -1})

                const resultArray = [...allTagRes,...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }
        }

        if( tag1 && tag2 ) {
            if(sort_type === 'hot') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({"metadata.no_of_views": -1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_views": -1})

                const resultArray = [...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }

            if(sort_type === 'popular') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({"metadata.no_of_answers": -1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_answers": -1})

                const resultArray = [...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }

            if(sort_type === 'newest') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})    
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({createdAt: -1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({createdAt: -1})

                const resultArray = [...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }

            
            if(sort_type === 'oldest') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})    
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({createdAt: 1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({createdAt: 1})

                const resultArray = [...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }

            
            if(sort_type === 'most liked') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({"metadata.no_of_upvotes": -1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_upvotes": -1})

                const resultArray = [...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }

            if(sort_type === 'unanswered') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({"metadata.no_of_answers": 1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_answers": 1})

                const resultArray = [...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }
            else {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})    
                const twoTagRes = await Question.find({
                    $and:[
                        {"metadata.question_status" : "Published"},
                        {
                            $or : [
                                {"metadata.relatedTo": { $all: [tag1,tag2]}},
                                {"metadata.relatedTo": { $all: [tag1,tag3]}},
                                {"metadata.relatedTo": { $all: [tag2,tag3]}}
                            ]
                        }
                    ]
                }).sort({createdAt: -1})
    
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({createdAt: -1})

                const resultArray = [...twoTagRes,...anyTagRes]
                let finalAnswerArray = []
                let i = ((page_number-1)*12)
                let n = ((page_number*12)-1)

                for(i ; i<=n ; i++) {
                    if(resultArray[i]) finalAnswerArray.push(resultArray[i])
                }
                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : finalAnswerArray
                })
                return
            }
        }

        if( tag1 ) {
            if(sort_type === 'hot') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_views": -1}).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }
            
            if(sort_type === 'popular') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_answers": -1}).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }
           
            if(sort_type === 'newest') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort( {createdAt: -1}).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }

            
            if(sort_type === 'oldest') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort( {createdAt: 1}).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }

            if(sort_type === 'most liked') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort( {"metadata.no_of_upvotes": -1} ).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }
            if(sort_type === 'unanswered') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort({"metadata.no_of_answers": 1}).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }
            else {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find({
                    $and: [
                        {"metadata.question_status" : "Published"},
                        {"metadata.relatedTo": { $in: [tag1,tag2,tag3]}}
                    ]
                }).sort( {createdAt: -1}).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }
        }
        else{
            if(sort_type === 'hot') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find(
                        {"metadata.question_status" : "Published"}
                ).sort({"metadata.no_of_views": -1}).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }
            
            if(sort_type === 'popular') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find(
                    {"metadata.question_status" : "Published"}
                ).sort({"metadata.no_of_answers": -1}).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }
           
            if(sort_type === 'newest') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find(
                        {"metadata.question_status" : "Published"},
                ).sort( {createdAt: -1}).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }

            
            if(sort_type === 'oldest') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find(
                        {"metadata.question_status" : "Published"},                    
                ).sort( {createdAt: 1}).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }

            if(sort_type === 'most liked') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find(
                        {"metadata.question_status" : "Published"},
                ).sort( {"metadata.no_of_upvotes": -1} ).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }
            if(sort_type === 'unanswered') {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find(
                        {"metadata.question_status" : "Published"}
                ).sort({"metadata.no_of_answers": 1}).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }
            else {
                const docCount = await Question.countDocuments({"metadata.question_status" : "Published"})
                const anyTagRes = await Question.find(
                        {"metadata.question_status" : "Published"},
                    ).sort( {createdAt: -1}).skip( (page_number-1)*12 ).limit(12)

                res.status(200).send({ 
                    totalQuestionCount: docCount,
                    questions : anyTagRes
                })
                return
            }
        }


        } catch (err) {
            console.log(err)
            res.status(400).send("Error ->" + err)
        }
}

const handleEditQuestion = async(req,res) => {
    const {
        user_id,
        question_id,
        question,
        question_sub_text
    } = req.body

    try{
        const response = await Question.find({
            $and: [
                { _id: {$eq:question_id }},
                { "metadata.createdBy" : { $eq: user_id}}
            ]
        } )
        console.log(response)
        if (response.length === 0)  {
            res.status(404).send("User or question not Found") 
            return
        }
        const result = await Question.findByIdAndUpdate({_id:question_id},{
            $set : {
                question,
                question_sub_text,
                "metadata.modifiedBy" : user_id,
                "metadata.isEdited" : true
            }
        },{useFindAndModify: false})

        console.log(result)
        if(result) res.status(200).send("OK")
    } catch (err) {
        console.log(err)
        res.status(400).send("Error ->" + err)
    }
}

const handleDeleteQuestion = async (req,res) => {
    const user_id = req.query.user_id;
    const question_id = req.query.question_id;

    try{
        const response = await Question.findOneAndUpdate(
            { $and: [
                { _id: {$eq:question_id }},
                { "metadata.createdBy" : { $eq: user_id}}
            ]},
            {
                $set: {"metadata.question_status": "Deleted"}
            },
            {returnOriginal: false}
        )
        console.log(response)
        if (!response)  {
            res.status(404).send("User or question not Found") 
            return
        } 
        res.status(200).send("Deleted" )

    } catch (err) {
        console.log(err)
        res.status(400).send("Error ->" + err)
    }
}

const handleQuestionView = async (req,res) => {
    const question_id = req.query.questionID;

    try{
        const response = await Question.findByIdAndUpdate({_id:question_id},
            {
                $inc : {
                    "metadata.no_of_views" : 1
                }
            }, {useFindAndModify: false} )

        console.log(response)
        if(!response) res.status(404).send("User Not Found")
        else res.status(201).send("Viewed")
    } catch (err) {
        console.log(err)
        res.status(400).send("Error ->" + err)
    }
}

const handleQuestionUpvote = async (req,res) => {
    const question_id = req.query.questionID;

    try{
        const response = await Question.findByIdAndUpdate({_id:question_id},
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
        res.status(400).send("Error ->" + err)
    }
}

const handleGetQuestionCategory = async (req,res) => {
    try{
        const result = await Category.find()
        if(result){
            res.status(200).send({
                categories : result[0].category
            })
        }
    } catch (err) {
        console.log(err)
        res.status(400).send("Error ->" + err)
    }
}

const handleGetQuestionTopic = async (req,res) => {
    try{
        const result = await Topic.find()
        if(result){
            res.status(200).send({
                topics : result[0].topic
            })
        }
    } catch (err) {
        console.log(err)
        res.status(400).send("Error ->" + err)
    }
}

const handleGetTags = async (req,res) => {
    try{
        const result = await Tag.find()
        if(result){
            res.status(200).send({
                tags : result[0].tag
            })
        }
    } catch (err) {
        console.log(err)
        res.status(400).send("Error ->" + err)
    }
}

const handleGetQuestionByID = async (req,res) => {
    const question_id = req.query.questionID;

    try{
        const response = await Question.find({_id: question_id})
        if(response.length === 0) {
            res.status(404).send("question does not exits")
            return
        }
        res.status(200).send({question: response})
    } catch (err) {
        console.log(err)
        res.status(400).send("Error ->" + err)
    }
}

module.exports = {
    handleCreateQuestion,
    handleGetQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    handleQuestionUpvote,
    handleGetQuestionCategory,
    handleGetQuestionTopic,
    handleQuestionView,
    handleGetTags,
    handleGetQuestionByID,
    handleGetQuestionForLandingPage
}