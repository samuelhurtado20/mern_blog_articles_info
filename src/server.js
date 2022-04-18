const { response } = require("express");
const express = require("express");
const MongoClient = require("mongodb").MongoClient
var ObjectId = require('mongodb').ObjectId; 


const app = express();
app.use(express.json())
//db
const ConnString = "mongodb://uxghgh4iwlhri0ewumpj:EecihdRwN2UrgiDdlABR@biavrh7viutgdfb-mongodb.services.clever-cloud.com:27017/biavrh7viutgdfb"
var database;
app.listen(8000, ()=>
{
    console.log('server on port 8000')
    MongoClient.connect(ConnString, {useNewUrlParser:true},
        (error,client)=>{
            database=client.db('biavrh7viutgdfb')
            console.log('Mongo db connection successfull')
        });
});

app.get('/api/article/', (req, res) =>
{
    database.collection("articlesBlog").find({}).toArray((error,result)=>{
        if(error){
            console.log(error)
        }
        res.send(result);
    })
})

app.get('/api/article/:id', (req, res) =>
{
    const id = req.params.id;
    database.collection("articlesBlog").findOne({"_id": ObjectId(id)}, (error,result)=>{
        if(error){
            console.log(error)
        }
        res.json(result)
    });
})

app.post("/api/article/:id/add-comment", async (req, res) =>
{  
    const comment = req.body;
    const id = req.params.id;

    const article = await database.collection("articlesBlog").findOne({"_id": ObjectId(id)});
    const update = await database.collection("articlesBlog").updateOne({"_id": ObjectId(id)}, { $push: comment });
    article = await database.collection("articlesBlog").findOne({"_id": ObjectId(id)});
    res.send(article);
});

app.post("/api/article/", (req, res) =>
{
    const article = req.body;
    database.collection("articlesBlog").insertOne(article, (error,result)=>{
        if(error){
            console.log(error)
        }
        res.json(result)
    });
});

app.delete("/api/article/:id", (req, res) =>
{
    const id = req.params.id;
    database.collection("articlesBlog").deleteOne({"_id": ObjectId(id)}, (error,result) => 
    {
        if(error){
            console.log(error)
        }
        res.json(result)
    });
});

//
const WithDB = async (operations, res) => {
    try
    {
        const cli = await MongoClient.connect(ConnString, {useNewUrlParser:true, useUnifiedTopology: true});
        var db = cli.db('biavrh7viutgdfb')
        console.log('Mongo db connection successfull')
        await operations(db);
        cli.close();
    }
    catch(error)
    {
        res.status(500).json({ message: "Error: ", error})
    }
}

app.get("/api/articles/:name", async (req, res) => {
    await WithDB(async (db) => {
        const articleName = req.params.name;
        const articles = await db.collection("articlesBlog").findOne({ article: articleName });
        //const articles = await db.collection("articlesBlog").find({ article: articleName }).toArray();
        res.status(200).json(articles);
    }, res);
})