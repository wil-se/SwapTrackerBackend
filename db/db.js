require('dotenv').config({ path: `${__dirname}/../.env`})

const {MongoClient} = require('mongodb')

let mongoClient = null;
let cachedDb = null;

const connectMongodb = async () =>{
    
    if (cachedDb && await mongoClient.isConnected()) {
        console.info("cached db connection established");
        return cachedDb;
    }


    try{

        mongoClient = await MongoClient(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            poolSize: 10
        }).connect();

        if ( ! (await mongoClient.isConnected())) {
            console.error("Error : ", err);
            throw new Error(`Unable to connect MongoDb Client, Reason: ${err}`);
        }
        cachedDb = await client.db('Cluster0');
        console.info("db connection established");
        return cachedDb;
    }catch(err){
        console.log("Database error: %s", err);
    }
}

module.exports = {connectMongodb}
