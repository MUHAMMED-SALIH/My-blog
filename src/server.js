import express from 'express';
import bodyparser from 'body-parser';
import {MongoClient} from 'mongodb';
import path from 'path'

const app=express();

// const articleInfo={

//     'learn-react':{
//         upVotes:0,
//         comments:[]
//     },
//     'learn-node':{
//         upVotes:0,
//         comments:[]
//     },
//     'my-thoughts-on-resumes':{
//         upVotes:0,
//         comments:[]
//     }
// };

app.use(express.static(path.join(__dirname,'/build')));

 const withDb =async(operation,res)=>{
    try{
        const client = await MongoClient.connect("mongodb://localhost:27017",{useNewUrlParser:true,useUnifiedTopology:true});
        const db=client.db('my-blog');
       await operation(db);
        client.close();
        }
        catch(error){
            console.log(error);
            res.status(500).json({msg:"Db connection error occured",error});
        }
}

app.use(bodyparser.json());

app.get('/api/article/:name',async(req,res) =>{
    const articleName=req.params.name;
    withDb(async(db)=>{
        const articleInfo = await db.collection('articles').findOne({'name':articleName});
        res.status(200).json(articleInfo);
    },res);




});





app.post('/api/article/:name/upvotes',async (req,res)=>{

    const articleName=req.params.name;
    withDb(async(db)=>{
        const articleInfo=await db.collection('articles').findOne({'name':articleName});
        await db.collection("articles").updateOne({'name':articleName }, {'$set':{ 'upVotes':articleInfo.upVotes + 1} }
          );
        const udaptedArticle=await db.collection('articles').findOne({'name':articleName});
       
        res.status(200).json(udaptedArticle);
    },res);
  


    
});

app.post('/api/article/:name/add-comment',(req,res)=>{
    const articleName=req.params.name;
    const {userName,text}=req.body;

    withDb(async(db)=>{
        const articleInfo= await db.collection('articles').findOne({name:articleName});
        console.log(articleInfo);
        const newComment=articleInfo.comments.concat({userName,text});
        console.log(newComment);
        await db.collection('articles').updateOne({name:articleName},{'$set':{'comments': newComment}});
        const updateArticle = await db.collection('articles').findOne({name:articleName});
        res.status(200).json(updateArticle);
    },res)


});


app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname+'/build/index.html'));
})
app.listen('8080',()=>console.log("connnected to port 8080"));