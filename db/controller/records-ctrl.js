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
    const userCheck = await collection.find({address:body.address})
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

createOrUpdateBalanceOverview = async (req,res) => {
    const body = req.body
    const listRecord = [];
    if(!body.address) {
		return res.status(400).json({
				success:false,
				error:'body mancante',
			})
	}
    const collection = await getCollection('Users');
    const userFinded = await collection.findOne({address:body.address})
    
    if(!userFinded.balanceOveview){
        let singleBalanceOverview = body.singleBalanceOveview
        let newKey = new Date(Object.keys(singleBalanceOverview))
        
        singleBalanceOverview = {
                                    [`${newKey.getFullYear()}/${newKey.getMonth()+1}/${newKey.getDate()}`]:singleBalanceOverview[Object.keys(singleBalanceOverview)]
                                }
        console.log("vediamo questo nuovo item di balance overview ", singleBalanceOverview)
        listRecord.push(singleBalanceOverview)
        await collection
        .findOneAndUpdate({ address: body.address },
                          { $set: { balanceOveview:listRecord} },
                          (err,resp)=>{
                            if(!err){
                                return res.status(201).json({
                                    success:true,
                                    message: `${body.address} balance overview inizializzata`
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
    else {
        let newBalanceOverview = []
        let newSingleBalanceOverview = body.singleBalanceOveview
        let newKey = new Date(Object.keys(newSingleBalanceOverview))
        let notUpdated = false
        newSingleBalanceOverview = {
                                    [`${newKey.getFullYear()}/${newKey.getMonth()+1}/${newKey.getDate()}`]:newSingleBalanceOverview[Object.keys(newSingleBalanceOverview)]
                                }
        console.log("vediamo questo item aggiornato di balance overview ", newSingleBalanceOverview)
        let newKeySingleBalanceOverview = new Date(Object.keys(newSingleBalanceOverview)).getTime()                        
        userFinded.balanceOveview?.map((oldSingleBalanceOverview)=>{
            let oldKeySingleBalanceOverview = new Date(Object.keys(oldSingleBalanceOverview)).getTime()
            console.log("vediamo queste key ",oldKeySingleBalanceOverview, newKeySingleBalanceOverview, Object.keys(oldSingleBalanceOverview), Object.keys(newSingleBalanceOverview))
            if(oldKeySingleBalanceOverview === newKeySingleBalanceOverview){
                console.log("ma alla fine entro??",oldKeySingleBalanceOverview )
                oldSingleBalanceOverview[Object.keys(oldSingleBalanceOverview)] 
                === 
                newSingleBalanceOverview[Object.keys(newSingleBalanceOverview)] ? 
                notUpdated = true
                :

                oldSingleBalanceOverview[Object.keys(oldSingleBalanceOverview)] = newSingleBalanceOverview[Object.keys(newSingleBalanceOverview)];

                newBalanceOverview.push(oldSingleBalanceOverview)
                console.log("vediamo questa lista", newBalanceOverview)
                
                
            }
            newBalanceOverview.push(oldSingleBalanceOverview)
            console.log("vediamo la lista ora" , newBalanceOverview)
        })

        if(newBalanceOverview.length >0) {
            await collection
                .findOneAndUpdate({ address: body.address },
                          { $set: { balanceOveview:newBalanceOverview} },
                          (err,resp)=>{
                            if(!err){
                                return res.status(201).json({
                                    success:true,
                                    message: `${body.address} balance overview aggiornata con nuovo item`
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
        else if (notUpdated){
            return res.status(201).json({
                success:true,
                message: `${body.address} balance overview non aggiornata`
            })
        }
        else {
            collection
            .findOneAndUpdate({ address: body.address },
                      { $push: { balanceOveview:newSingleBalanceOverview} },
                      (err,resp)=>{
                        if(!err){
                            return res.status(201).json({
                                success:true,
                                message: `${body.address} balance overview aggiornata`
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

    const tradeFindedInBuy = await collection.find({tokenTo:body.tokenFrom,status:{$lt:100}}).toArray()
    
    let tradeFindendInBuyLocal = tradeFindedInBuy
    
    const closeTrade = async ()=>{
            
            console.log("vediamo... ", tradeFindendInBuyLocal)
            let sellTrade = body;
            tradeFindendInBuyLocal.map(async (buyTrade)=>{
                
                console.log(sellTrade.amountIn > buyTrade.amountOut, sellTrade.amountIn , buyTrade.amountOut, )
                
                    if(Number(sellTrade.amountIn) > buyTrade.amountOut && buyTrade.status !== 100){
                        console.log("entro nell'if")
                        buyTrade.status = 100;
                         await closeTrade()                                   
                        
                    }
                    else {
                        buyTrade.status = ((sellTrade.amountIn/buyTrade.amountOut)*100);
                        console.log("entro nell else")
                        return;
                    }
                
            })

        
    }

    await closeTrade()

    console.log("vediamo dopo ", tradeFindendInBuyLocal)
        
    tradeFindendInBuyLocal.map(async(tradeBuySelled,i)=>{
        console.log("ma itera??", tradeBuySelled, i)
        await collection.findOneAndUpdate({tokenTo:tradeBuySelled.tokenTo,status:{$lt:100}},
            { $set: { status:tradeBuySelled.status  } },
            (err,resp)=>{
              if(!err){
                  console.log("resp update ", resp)
              }
              else {
                  console.log("err update ", err)
              }
            })
    })

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

getDashboardData = async (req,res) => {
    const body = req.body;

    if(!body){
        return res.status(400).json({
            success:false,
            error:'body mancante',
        })
    }

    const collection = await getCollection('Trades');
    console.log("vediamo l'account ", body.account)
    const closedTrades = await collection.find({user:body.account,status:100}).toArray()
    const openedTrades = await collection.find({user:body.account,status:{$lt:100}}).toArray()
    let uniqueOpenedTrades = []
    let closedPlList = {}

    /*openedTrades?.map((openedTrade)=>{
        closedTrades?.map((closedTrade)=>{
            if(closedTrade.tokenTo !== openedTrade.tokenFrom){
                uniqueOpenedTrades.push(openedTrade);
            }

        })
    })

    const calcPl = (trade) => {
        let valueIn = trade?.amountIn * trade?.priceFrom;
        let valueOut = trade?.amountOut * trade?.priceTo;
        return valueOut - valueIn;
    }
    
    closedTrades?.map((closedTrade)=>{
        let dateTrade = new Date(closedTrade.timestamp);

        if(!closedPlList[dateTrade.getDate()]){
            closedPlList[dateTrade.getDate()] = calcPl(closedTrade) 

        }
        else{
            closedPlList[dateTrade.getDate()] += calcPl(closedTrade) 
        }

    })*/


    if(closedTrades && openedTrades){
        console.log("entro qui??")
        return res.status(201).json({
            created:true,
            data: {
                closedTrades:closedTrades,
                openedTrades:openedTrades,
            }
        })

    }


}





module.exports = {
	createOrUpdateUser,
    createOrUpdateBalanceOverview,
    updateUserTokenList,
    insertOrUpdateTrades,
    getTrades,
    getDashboardData,

}
