require("dotenv").config()
require("../model/post")

import mongoose from 'mongoose'
import request from "request"
import moment from "moment"

const messageSchema  = mongoose.model("MessageSchema")

let nameDict = {}

const month = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Des"]

let postWebhook = (req, res) => {

    // Parse the request body from the POST
    let body = req.body;
    
    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {
    
        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {
    
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            // console.log(webhook_event);


            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            // console.log('Sender PSID: ' + sender_psid);
            // console.log(webhook_event.message);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);      
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });
    
        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');
    
    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
      
}


let getWebhook = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
        
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
        
        } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
        }
    }
}

function saveName(sender_psid, name){
    nameDict[sender_psid]["name"] = name;
}


function firstTrait(nlp, name) {
    return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
}

async function handleMessage(sender_psid, message){
    if(message.text){
        const post = new messageSchema({
            sender_psid: sender_psid,
            message:  message.text,
            date: moment().format()
        })
        // console.log(post)
        post.save(function(err){
            if(err){
              console.log(err.message)
            }
          })
        let entities = ["wit$greetings", "wit$thanks", "wit$bye", "wit$datetime:$datetime"]
        let selectedEntity = ""

        // console.log("THE INCOMiNG MESSAGE WAS " + message.text)

        entities.forEach((name) => {
            let entity = firstTrait(message.nlp, name)
            if(entity && entity.confidence>0.8){
                selectedEntity = name
            }
        })

        if(!nameDict.hasOwnProperty(sender_psid)){
            nameDict[sender_psid] = {"status": 0}
        }

        if(selectedEntity == ""){
            if(nameDict[sender_psid]["status"]==4){
                callSendAPI(sender_psid, `Hi ${nameDict[sender_psid]["name"]}! What can I do for you?`)
                let response = {
                    "attachment":{
                        "type":"template",
                        "payload":{
                          "template_type":"generic",
                          "elements": [{
                            "title": "Do you want to re-input your data?",
                            "subtitle": "Tap a button to answer.",
                            "buttons": [
                                {
                                "type": "postback",
                                "title": "Yeahh!",
                                "payload": "yes",
                                },
                                {
                                "type": "postback",
                                "title": "No thanks!",
                                "payload": "no",
                                }
                            ],
                            }]
                        }
                    }
                }
                await callSendTemplateAPI(sender_psid, response)
            }else if(nameDict[sender_psid]["status"]==3){
                            
                const agreement =["yes", "yeah", "yup", "y", "ya", "yea", "yo"]
                const disagreement = ["nah", "na", "no", "nope"]
                if(agreement.includes(message.text.toLowerCase())){
                    let count = countBirthday(sender_psid)
                    nameDict[sender_psid]["status"] = 4
                    callSendAPI(sender_psid, `There are ${count} days left until your next birthday`)

                }else if(disagreement.includes(message.text.toLowerCase())){
                    callSendAPI(sender_psid, "Have a good day")
                    callSendAPI(sender_psid, "Byee~")
                    nameDict[sender_psid]["status"] = 4
                }else{
                    callSendAPI(sender_psid, "Please answare with yes or no")
                }
            }else if(nameDict[sender_psid]["status"]==2){
                nameDict[sender_psid]["birthdate"] = message.text
                
                if(moment(message.text, "YYYY-M-D", true).isValid()){
                    let date = message.text.split("-")
                    let Y = date[0]
                    let M = date[1]
                    let D = date[2]
                    let MM
                    if(M<=12 && M>=1){
                        MM = month[M-1]
                    }
                    let str = D + " " + MM + " " + Y
    
                    await callSendAPI(sender_psid,`So your birthdate is on ${str}`);
                    
                    let response = {
                        "attachment":{
                            "type":"template",
                            "payload":{
                              "template_type":"generic",
                              "elements": [{
                                "title": "Is this the right date?",
                                "subtitle": "Tap a button to answer.",
                                "buttons": [
                                    {
                                    "type": "postback",
                                    "title": "Owhyeahh!",
                                    "payload": "right",
                                    },
                                    {
                                    "type": "postback",
                                    "title": "Nononono!",
                                    "payload": "wrong",
                                    }
                                ],
                                }]
                            }
                        }
                    }
                    await callSendTemplateAPI(sender_psid, response)
                    
                    // let response = {
                    //     "text": "is this your birthdate?",
                    //     "quick_replies" : [
                    //         {
                    //           "contentType": 'text',
                    //           "title": 'Yeah!',
                    //           "payload": 'Yes'
                    //         },
                    //         {
                    //           "contentType": 'text',
                    //           "title": 'No',
                    //           "payload": 'No'
                    //         }
                    //       ]
                    // }
                    
                    // await callSendTemplateAPI(sender_psid, response)

                }else{
                    callSendAPI(sender_psid, "Sorry I don't understand, Try to send the date with this format: YYYY-MM-DD")
                }

            }else if(nameDict[sender_psid]["status"] == 1){
                nameDict[sender_psid]["status"] = 2
                saveName(sender_psid, nameDict[sender_psid]["name"])
                nameDict[sender_psid]["name"] = message.text
                await callSendAPI(sender_psid,'And when is your birthdate?(YYYY-MM-DD)');
            }else if(nameDict[sender_psid]["status"] == 0){
                callSendAPI(sender_psid, "Try to say 'hi' to the bot")
                // nameDict[sender_psid]["status"] = 1
            }else {
                callSendAPI(sender_psid, "This bot needs more improvement, try to say 'hi', 'bye' or 'thanks'!")
            }
        }else{
            if(selectedEntity == "wit$greetings"){
                // nameDict[sender_psid]["status"] || 
                if(nameDict[sender_psid]["status"]==0){
                    await callSendAPI(sender_psid,'Hi there! Could you tell me what is your name?');
                    nameDict[sender_psid]["status"] = 1

                }else if(nameDict[sender_psid]["status"]>=1){
                    await callSendAPI(sender_psid,`Hi ${nameDict[sender_psid]["name"]}`);
                    if(nameDict[sender_psid]["status"] == 2){
                        await callSendAPI(sender_psid,'When is your birthdate?(YYYY-MM-DD)');
                    }
                }
            }else if(selectedEntity == "wit$thanks"){
                await callSendAPI(sender_psid,"You're welcome!");

            }else if(selectedEntity == "wit$bye"){
                await callSendAPI(sender_psid,'Bye-bye');
            }
        }

    }else{

    }
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
    let response;
  
    // Get the payload for the postback
    let payload = received_postback.payload;

    const post = new messageSchema({
        sender_psid: sender_psid,
        message:  received_postback.payload,
        date: moment().format()
    })
    // console.log(post)
    post.save(function(err){
        if(err){
          console.log(err.message)
        }
      })
    
    // Set the response based on the postback payload
    if (payload === 'right') {
        response = "By the way, do you want to know when is your next birthday?"   
        nameDict[sender_psid]["status"] = 3
        
    }else if (payload === 'wrong') {
        response = "Enter your birthdate with this format 'YYYY-MM-DD'" 
    }else if (payload === 'yes') {
        await callSendAPI(sender_psid, "Resetting your data...");
        nameDict[sender_psid]["status"] = 0
        response = "Try to say 'hi' to the bot" 
    }else if (payload === 'no') {
        response = "Ohh okay" 
    }
    // Send the message to acknowledge the postback
    await callSendAPI(sender_psid, response);
}

function callSendTemplateAPI(sender_psid, response){
    return new Promise( (resolve, reject) => {
        try{
  
            let request_body = {
              "recipient": {
                "id": sender_psid
              },
              // "message": {"text": response}
              "message": response
            }
          
            // Send the HTTP request to the Messenger Platform
            request({
              "uri": "https://graph.facebook.com/v6.0/me/messages",
              "qs": { "access_token": process.env.FACEBOOK_PAGE_TOKEN },
              "method": "POST",
              "json": request_body
            },  (err, res, body) => {
              if (!err) {
              //   console.log('message sent!')
                resolve('message sent!')
              } else {
              //   console.error("Unable to send message:" + err);
                reject("Unable to send message:" + err);
              }
            }); 
        } catch (err) {
            reject(err);
        }
        
    })
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  return new Promise( (resolve, reject) => {
      try{

          let request_body = {
            "recipient": {
              "id": sender_psid
            },
            "message": {"text": response}
          }
        
          // Send the HTTP request to the Messenger Platform
          request({
            "uri": "https://graph.facebook.com/v10.0/me/messages",
            "qs": { "access_token": process.env.FACEBOOK_PAGE_TOKEN },
            "method": "POST",
            "json": request_body
          },  (err, res, body) => {
            if (!err) {
              resolve('message sent!')
            } else {
              reject("Unable to send message:" + err);
            }
          }); 
      } catch (err) {
          reject(err);
      }
      
  })
}


function countBirthday(sender_psid){
    let birthdate = nameDict[sender_psid].birthdate
    birthdate = birthdate.split("-")
    let month = birthdate[1]
    let day = birthdate[2]
    let today = moment().toObject()
    // console.log(...birthdate)
    birthdate = [today.years, month, day]

    let now = moment(today)
    let birthday = moment(birthdate)

    let diff = birthday.diff(now, 'days')

    if(diff>=0){
        return Math.ceil(diff)
    }else{
        return Math.ceil(diff)+365

    }
}

module.exports = {
    postWebhook: postWebhook,
    getWebhook: getWebhook,
}