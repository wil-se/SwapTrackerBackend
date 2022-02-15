require('dotenv').config({path:'../.env'});

const {MongoClient} = require('mongodb')
const connectMongodb = async () =>{
    
    try{
        const client = await MongoClient.connect(
            "mongodb+srv://swaptrackerDefi:Swap123@cluster0.r0abn.mongodb.net/Cluster0?retryWrites=true&w=majority",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
        const db = await client.db('Cluster0');
        return db
    }catch(err){
        return err;
    }
}
module.exports = {connectMongodb}
