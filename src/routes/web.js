import express from "express"
import homepageController from "../controller/homepageController"
import chatbotController from "../controller/chatbotController"
import mongoose from 'mongoose'

require("../model/post")

const messageSchema  = mongoose.model("MessageSchema")

let router = express.Router();

let initWebRoutes = (app) => {

    
    router.get("/", homepageController.getHomepage);


    router.get("/webhook", chatbotController.getWebhook);
    router.post("/webhook", chatbotController.postWebhook);


    router.get("/messages", async (req, res) =>{
        
        console.log("Get all messages history");

        const message = await messageSchema.find({});
      
        res.status(200).json({
            data : message
        });

    })

    router.get("/messages/sender/:sender_psid", async (req, res) => {
        console.log("Get messages history by id");
        var id = mongoose.Types.ObjectId(req.params.sender_psid);

        const message = await messageSchema.findById(sender_psid);

        res.status(200).json({
            data : message
        });
    })

    router.get("/messages/:id", async (req, res) => {
        console.log("Get messages history by id")
        var id = mongoose.Types.ObjectId(req.params.id)
        console.log(id)
        const message = await messageSchema.findById(id);

        res.status(200).json({
            data : message
        });
    })

    router.delete('/messages/:id', async (req, res) =>{
        console.log("Delete message by id")
        var id = mongoose.Types.ObjectId(req.params.id)
        const message = await messageSchema.deleteOne({_id:id})
      
        res.status(200).json("Message deleted");
      })

    return app.use("/", router)
}



module.exports = initWebRoutes;