const {MongoClient} = require('mongodb')
require('dotenv').config()


async function connect(){
    console.log(process.env.DB_URL);

    const client = await MongoClient.connect(process.env.DB_URL,{useNewUrlParser: true,useUnifiedTopology: true})
        .catch(error => console.log(error))    

    // const db = await client.db('Cluster0');
    
    // return db;
}   

connect();