import mongoose from "mongoose";


const MessageSchema = new mongoose.Schema({
    sender_psid:{
        type: String
    },
    message:{
        type: String
    },
    date:{
        type: Date
    },
})


module.exports = mongoose.model("MessageSchema", MessageSchema);
