const {MongoClient} = require('mongodb')


const connectMongodb = async () =>{
 
    const client = await MongoClient.connect(process.env.DB_URL,{useNewUrlParser: true,useUnifiedTopology: true,reconnectTries:60,reconnectInterval:1000})
        .catch(error => console.log(error))

    const db = await client.db('Cluster0');
    
    return db

    
    
    

}
module.exports = {connectMongodb}
