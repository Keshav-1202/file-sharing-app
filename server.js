const express=require('express');
const path=require('path');
const app=express();
app.use(express.json());

require('dotenv').config()
const port=process.env.PORT || 3000;
const connectDB=require('./config/db');
const router=require('./routes/files');
const show=require('./routes/show');
app.use('/api/files',router);
app.use('/files',show);
app.use('/files/download',require('./routes/download'));
app.use(express.static('public'));
app.set('views',path.join(__dirname,'/views'));
app.set('view engine','ejs');
const start=async()=>
{
    try{
        await connectDB(process.env.MONGO_URI)
        app.listen(3000,console.log(`server is listening on ${port}...`))
    }
    catch(error)
    {
        console.log(error)
    }
}
start()

