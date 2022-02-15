require('dotenv').config({ path: `${__dirname}/../.env`})

const {MongoClient} = require('mongodb')

let mongoClient = null;
let cachedDb = null;

const connectMongodb = async () =>{
    
    if (cachedDb) {
        console.info("cached db connection established");
        return cachedDb;
    }


    try{

        mongoClient = await MongoClient.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).catch(error => console.log(error));

        cachedDb = await client.db('Cluster0');
        if(cachedDb)
            console.info("db connection established");
        return cachedDb;
    }catch(err){
        console.log("Database error: %s", err);
        return err;
    }
}

module.exports = {connectMongodb}
