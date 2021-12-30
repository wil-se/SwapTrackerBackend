const {getCollection} = require('../dataModels/dataModel')

createOrUpdateUser = async (req,res) => {
	console.log('sono entrato in create User',req.body)
	const body = req.body;
	const listRecord = [];
	listRecord.push(body);
	
	if(!body.address) {
		return res.status(400).json({
				success:false,
				error:'body mancante',
			})
	}
	const collection = await getCollection('Users');
    console.log("arriva fin qui");
    const userFinded = await collection.findOneAndUpdate({ address: body.address },
                                        { $set: { lastLogin: body.lastLogin } })
    if(userFinded.value){
        return res.status(201).json({
            success:true,
            id:req._id,
            message: `${body.address} aggiornato`,
        })
    }
    else{
        
        await collection.insertMany(listRecord,{safe:true},(err,resp)=>{
            if(!err){              
                return res.status(201).json({
                    success: true,
                    id: req._id,
                    message: `${body.address} , ${JSON.stringify(resp)} creato!`,
                })
            }
            else{
                return res.status(400).json({
                    err,
                    message: `${body.address} non creato!`,
                })
    
            }
        })		
    }
	
}

createOrUpdateUserTokenList = async (req,res) => {
    console.log('sono entrato in create User',req.body)
	const body = req.body;
	const listRecord = [];
	listRecord.push(body);
	
	if(!body.address) {
		return res.status(400).json({
				success:false,
				error:'body mancante',
			})
	}
	const collection = await getCollection('Users');
    console.log("arriva fin qui");
    const userFinded = await collection.findOne({ address: body.address })
    console.log("vediamo ",userFinded)
    if(!userFinded.tokenList){

        await collection
            .findOneAndUpdate({ address: body.address },
                              { $set: { tokenList: body.tokenList } },
                              (err,resp)=>{
                                if(!err){
                                    return res.status(201).json({
                                        success:true,
                                        message: `${body.address} tokenList creata`
                                    })
                                }
                                else {
                                    return res.status(400).json({
                                        success:false,
                                        message: `${body.address} ${err}`
                                    }) 
                                }
                              })
    }
    if(userFinded.tokenList[body.chainId]){
        
       Array(userFinded.tokenList[body.chainId]).find((tokenAddress,index)=>{
           String(tokenAddress[index]).toLocaleLowerCase() === String(body.tokenList[body.chainId][index].toLocaleLowerCase()) ?  
                console.log("sono tutti uguali") :
                console.log("non sono tutti uguali"); 
       }) 
    }

    
    if(userFinded.value){
        return res.status(201).json({
            success:true,
            id:req._id,
            message: `${body.address} aggiornato`,
        })
    }
}



module.exports = {
	createOrUpdateUser,
    createOrUpdateUserTokenList

}
