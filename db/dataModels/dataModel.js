const {connectMongodb} = require('../db');

const getCollection = async(nameCollection) =>{
  try{
    const db = await connectMongodb()
    const collection = await db.collection(nameCollection)
    return collection;
  }catch(err){
    return err;
  }
}

module.exports = {getCollection};
