const {getCollection} = require('../dataModels/dataModel')

createOrUpdateUser = async (req,res) => {
	const body = req.body;
	const listRecord = [];
	
	
	if(!body.address) {
		return res.status(400).json({
				success:false,
				error:'body mancante',
			})
	}
	const collection = await getCollection('Users');
    const userFinded = await collection.findOneAndUpdate({ address: body.address },
                                        { $set: { lastLogin: body.lastLogin } })
    if(userFinded.value){
        return res.status(201).json({
            created:false,
            id:req._id,
            message: `${body.address} aggiornato`,
            data: userFinded.value
        })
    }
    else{
        body.tokenList = {
            1:[process.env.WETH],
            56:[process.env.WBNB]
        }
        listRecord.push(body);
        
        await collection.insertMany(listRecord,{safe:true},(err,resp)=>{
            if(!err){              
                return res.status(201).json({
                    created:true,
                    id: req._id,
                    message: `${body.address} , ${JSON.stringify(resp)} creato!`,
                    data: body
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

updateUserTokenList = async (req,res) => {
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
    const userFinded = await collection.findOne({ address: body.address })
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
        let oldTokenListLength = userFinded.tokenList[body.chainId].length
        let newTokenListByChainId = [...userFinded.tokenList[body.chainId],...body.tokenList[body.chainId]]
        userFinded.tokenList[body.chainId] = Array.from(new Set(newTokenListByChainId))

        await collection
        .findOneAndUpdate({ address: body.address },
                          { $set: { tokenList: userFinded.tokenList } },
                          (err,resp)=>{
                            if(!err){
                                return res.status(201).json({
                                    success:true,
                                    new_items: userFinded.tokenList[body.chainId].length - oldTokenListLength,
                                    message: `${body.address} tokenList aggiornata`
                                })
                            }
                            else {
                                return res.status(400).json({
                                    success:false,
                                    new_items: 0,
                                    message: `${body.address} ${err}`
                                }) 
                            }
                          })
      
    }
    if(!userFinded.tokenList[body.chainId]){
        await collection
        .findOneAndUpdate({ address: body.address },
                          { $set: { tokenList: body.tokenList } },
                          (err,resp)=>{
                            if(!err){
                                return res.status(201).json({
                                    success:true,
                                    message: `${body.address} tokenList aggiornata`
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

}


insertOrUpdateTrades = async (req,res) => {
    console.log("entro??")
    const body = req.body;
	const listRecord = [];
	listRecord.push(body);

    if(!body) {
		return res.status(400).json({
				success:false,
				error:'body mancante',
			})
	}
	const collection = await getCollection('Trades');

    
    
    
    const closeTrade = (async ()=>{
            const tradeFindedInBuy = await collection.find({tokenFrom:body.tokenTo, tokenTo:body.tokenFrom, status:true}).toArray()
            let sellTrade = body;
            tradeFindedInBuy.map(async (buyTrade)=>{
                let totalAmountOut = buyTrade.amountOut++
                if(sellTrade.amountIn > buyTrade.amountOut){
                    await collection
                    .findOneAndUpdate({tokenFrom:buyTrade.tokenTo, tokenTo:buyTrade.tokenFrom, status:true}
                                                        ,{ $set: { status: false } },(err,resp)=>{
                                                            if(!err){
                                                                console.log("resp:: ", resp)
                                                            }
                                                            else{
                                                                console.log("err", err)
                                                                
                                                            }
                                                        })
                     await closeTrade()                                   
                    
                }
                else {
                    await collection
                    .findOneAndUpdate({tokenFrom:buyTrade.tokenTo, tokenTo:buyTrade.tokenFrom, status:true}
                                                        ,{ $set: { status: false } },(err,resp)=>{
                                                            if(!err){
                                                                console.log("resp:: ", resp)
                                                                
                                                            }
                                                            else{
                                                                console.log("err", err)
                                                               
                                                            }
                                                        })
                }
            })
    })()
        
    

    await collection.insertMany(listRecord,{safe:true},(err,resp)=>{
        if(!err){              
            return res.status(201).json({
                created:true,
                id: req._id,
                message: `${body.txId} , ${JSON.stringify(resp)} creato!`,
                data: body
            })
        }
        else{
            return res.status(400).json({
                err,
                message: `${body.txId} non creato!`,
            })

        }
    })		


    

    
        
    

        
    
}

getTrades = async (req,res) => {
    const body = req.body;

    if(!body) {
		return res.status(400).json({
				success:false,
				error:'body mancante',
			})
	}

    const collection = await getCollection('Trades');

    const trades = await collection.find({user:body.account}).toArray();

    console.log("vediamo ",trades)

    if(trades){
        return res.status(201).json({
            created:true,
            data: trades
        })
    } 





}





module.exports = {
	createOrUpdateUser,
    updateUserTokenList,
    insertOrUpdateTrades,
    getTrades

}
