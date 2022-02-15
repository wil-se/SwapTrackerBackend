require('dotenv').config({ path: `${__dirname}/../.env`})

const {MongoClient} = require('mongodb')

let mongoClient = null;
let cachedDb = null;

const connectMongodb = async () =>{
    
    if (cachedDb && await mongoClient.isConnected()) {
        console.info("cached db connection established");
        return cachedDb;
    }

    mongoClient = new MongoClient(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        poolSize: 10
    });

    try{
        await mongoClient.connect();

        if ( ! (await mongoClient.isConnected())) {
            await mongoClient.connect(err => {
              if (err) {
                console.error("Error : ", err);
                throw new Error(`Unable to connect MongoDb Client, Reason: ${err}`
                );
              }
            });
        }
        cachedDb = await client.db('Cluster0');
        console.info("db connection established");
        return cachedDb;
    }catch(err){
        console.log("Database error: %s", err);
    }
}

module.exports = {connectMongodb}
