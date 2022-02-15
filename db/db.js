const {MongoClient} = require('mongodb')


const connectMongodb = async () =>{
    
    try{
        const client = await MongoClient.connect(process.env.DB_URL,{useNewUrlParser: true,useUnifiedTopology: true});
        const db = await client.db('Cluster0');
        return db
    }catch(err){
        return err;
    }
}
module.exports = {connectMongodb}
