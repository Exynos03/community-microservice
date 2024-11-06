const User = require('../models/user')

const handleRegisterUser =  async (req,res) => {
    const { user_id , email , name } = req.body;
    const currUser = { user_id , email , name}
    const newData = new User(currUser);

    try{
        const response = await User.find({
            $or: [
                {user_id: { $eq: user_id}},
                {email: { $eq: email }}
            ]
        })
        console.log(response)
        if(response.length > 0) {
            res.status(403).send("User already exists")
            return
        }
        const result = await newData.save()
        console.log(result)
        res.status(201).send("Done")
    } catch(err) {
        console.log(err)
        res.status(404).send("Error ->" + err)
    }
}

const handleGetUser = async (req,res) => {
    const user_id = req.query.userID

    try{
        const response = await User.find({user_id})
        if(response.length === 0) {
            res.status(404).send("user not found")
            return
        }
        res.status(200).send({ user : response})
    } catch(err) {
        console.log(err)
        res.status(404).send("Error ->" + err)
    }
}

module.exports = {
    handleRegisterUser,
    handleGetUser 
}