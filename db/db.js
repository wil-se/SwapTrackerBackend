const {MongoClient} = require('mongodb')


const connectMongodb = async () =>{
 
    const client = await MongoClient.connect(process.env.DB_URL,{useNewUrlParser: true,useUnifiedTopology: true})
        .catch(error => console.log(error))

    const db = await client.db('Cluster0');
    
    return db

    
    
    

}
module.exports = {connectMongodb}
