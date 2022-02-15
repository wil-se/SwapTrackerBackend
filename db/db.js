require('dotenv').config({ path: `${__dirname}/../.env`})

const {MongoClient} = require('mongodb')

var mongoClient = null;
var cachedDb = null;

const connectMongodb = async () =>{
    
    if (cachedDb && mongoClient) {
        console.info("A DB instance is already available, avoiding new connection.");
        return cachedDb;
    }

    try{

        mongoClient = await MongoClient.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).catch(error => console.log(error));

        cachedDb = await mongoClient.db('Cluster0');
        if(cachedDb)
            console.info("db connection established");
        return cachedDb;
    }catch(err){
        console.log("Database error: %s", err);
        return err;
    }
}

module.exports = {connectMongodb}
