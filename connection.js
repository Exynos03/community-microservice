const mongoose  = require('mongoose')
require('dotenv').config()

const connectMongoDB = async ( DBname ) => {
    const userName = process.env.MONGO_USER_NAME
    const userPassKey = process.env.MONGO_USER_PASSKEY
    const clusterName = process.env.MONGO_CLUSTER_NAME

    const dbURI = `mongodb+srv://${userName}:${userPassKey}@${clusterName}.xs6rfxc.mongodb.net/${DBname}?retryWrites=true&w=majority`
    
    return mongoose.connect(dbURI,{ useNewUrlParser:true, useUnifiedTopology: true})
}

module.exports = {
    connectMongoDB
}
