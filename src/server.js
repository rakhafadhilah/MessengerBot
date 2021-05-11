require("dotenv").config()
require("./model/post")

import mongoose from 'mongoose'
import express from 'express';
import bodyParser from 'body-parser'

import viewEngine from './config/viewEngine'
import initWebRoute from './routes/web'

const port = process.env.PORT || 3000;

const db = process.env.DB_CONNECTION


let app = express();

viewEngine(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


initWebRoute(app);


// mongodb+srv://admin:<password>@cluster0.800ak.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

mongoose.connect(
    db,
    { useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology : true },
    () => console.log("Connected to DB")
)

app.listen(port, ()=>{
    console.log(`Your App is running at port ${port}`);
})