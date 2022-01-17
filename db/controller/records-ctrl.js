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

    /*let mock_trade = {
        txId: "0xd313f213c405b9fbf0da9274842d5fdd0db9f6f15e15c4eb7221dd2d74611da0",
        user: "0x545d1561bb5eC7CF96a36Fb145D3B5928419142f",
        tokenFrom:"0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        tokenTo:"0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
        amountIn:1000000000000000,
        amountSwapped:90000,
        priceFrom:1000000,
        priceTo:20000,
        status:true,
        timestamp:new Date().now()



    }*/

    const tradeFinded = await collection.findOne({tokenFrom:body.tokenFrom, tokenTo:body.tokenTo})

    /*let tradeFindedUpdated  ={
        ...tradeFinded, 
        tradeFinded[mock_trade.amountIn]:tradeFinded.amountIn  += mock_trade.amountIn,
        amountSwapped:tradeFinded.amountSwapped += mock_trade.amountSwapped,

    
    }*/
    console.log(tradeFinded,body)

    if(!tradeFinded){
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
    insertTrades

}
