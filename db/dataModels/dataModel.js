const {connectMongodb} = require('../db');

const getCollection = async(nameCollection) =>{
 
  const db = await connectMongodb()
  
  const collection = await db.collection(nameCollection)
  return collection;
}

module.exports = {getCollection};
