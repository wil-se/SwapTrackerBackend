const {connectMongodb} = require('../db');

const getCollection = async(nameCollection) =>{
  try{
    const db = await connectMongodb()
  }catch(err){
    return 'CANNOT CONNECT'
  }
  try{
    const collection = await db.collection(nameCollection)
    return collection;
  }catch(err){
    return 'CANNOT GET COLLECTION';
  }
}

module.exports = {getCollection};
