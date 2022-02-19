const {getCollection} = require('../dataModels/dataModel')
require('dotenv').config({ path: `${__dirname}/../../.env`})
const url = require('url');
const moment = require('moment');

const BigNumber = require('bignumber.js')

getFiats = async (req,res) => {

    try{
        const collection = await getCollection('FiatPrices');
        await collection.find({}).toArray((err, records) => {
            if (err) {
                return res.status(400).json({ success: false, error: err })
            }   
            if (!records.length) {
                return res 
                    .status(404)
                    .json({ success: false, error: "record not found" })
            }   
            return res.status(200).json({ success: true, data: records })
        });
    }catch(err){
        return res.status(200).json({ 
            success: false,
            error: err
        });
    }
}

createOrUpdateUser = async (req,res) => {
	const body = req.body;
	const listRecord = [];
	
	
	if(!body.address) {
		return res.status(400).json({
				success:false,
				error:'body mancante',
			})
	}

    try{
        const collection = await getCollection('Users');
        const userFinded = await collection.findOneAndUpdate({ address: body.address },
                                            { $set: { lastLogin: body.lastLogin } })
        if(userFinded.value){
            return res.status(200).json({
                created:false,
                id:req._id,
                message: `${body.address} aggiornato`,
                data: userFinded.value
            })
        }
        else{
            body.tokenList = {
                1:[process.env.WETH.toLowerCase()],
                56:[process.env.WBNB.toLowerCase(),process.env.BUSD.toLowerCase(),process.env.USDT.toLowerCase(),process.env.SWPT.toLowerCase()]
            }
            body.address = body.address.toLowerCase()
            listRecord.push(body);
            
            await collection.insertMany(listRecord,{safe:true},(err,resp)=>{
                if(!err){              
                    return res.status(200).json({
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
    }catch(err) {
        console.log(err);
        return res.status(400).json({
            error: err,
            message: `Database error`,
        });
    }
	
}

createOrUpdateBalanceOverview = async (req,res) => {
    const body = req.body
    const listRecord = [];
    if(!body.address) {
		return res.status(400).json({
				success:false,
				error: "body mancante",
			})
	}
    
    let collection;
    let userFinded;
    try{
        collection = await getCollection('Users');
        userFinded = await collection.findOne({address:body.address});
    }catch(err){
        console.log("createOrUpdateBalanceOverview(): DB Error: %s", err);
        res.status(400).json({
            error: err,
            success: false
        });
    }
    

    if(!userFinded.balanceOverview){

        try{
            let singleBalanceOverview = body.singleBalanceOverview
            let newKey = new Date(Object.keys(singleBalanceOverview))
            
            singleBalanceOverview = { [`${newKey.getFullYear()}/${newKey.getMonth()+1}/${newKey.getDate()}`]:singleBalanceOverview[Object.keys(singleBalanceOverview)] }
            //console.log("createOrUpdateBalanceOverview(): singleBalanceOverview ", singleBalanceOverview)
            listRecord.push(singleBalanceOverview)
            await collection
            .findOneAndUpdate( { address: body.address }, { $set: { balanceOverview:listRecord} },
                (err,resp)=>{
                    if(!err){
                        return res.status(200).json({
                            success:true,
                            message: `${body.address} balance overview inizializzata`
                        })
                    }else {
                        return res.status(400).json({
                            success:false,
                            message: `${body.address} ${err}`
                        }) 
                    }
                }
            );
        }catch(err){
            console.log("createOrUpdateBalanceOverview(): Initialize balance overview failed: %s", err);
            res.status(400).json({
                error: err,
                success: false
            });
        }
        
    }
    else {

        try{

            let oldBalanceOverview;
            let newSingleBalanceOverview = body.singleBalanceOverview
            let newKey = new Date(Object.keys(newSingleBalanceOverview))
            let notUpdated = false
            newSingleBalanceOverview = { [`${newKey.getFullYear()}/${newKey.getMonth()+1}/${newKey.getDate()}`]:newSingleBalanceOverview[Object.keys(newSingleBalanceOverview)] }
            //console.log("createOrUpdateBalanceOverview(): newSingleBalanceOverview", newSingleBalanceOverview)
            let newKeySingleBalanceOverview = new Date(Object.keys(newSingleBalanceOverview)).getTime()                        
            userFinded.balanceOverview?.map((oldSingleBalanceOverview)=>{
                let oldKeySingleBalanceOverview = new Date(Object.keys(oldSingleBalanceOverview)).getTime()
                //console.log("createOrUpdateBalanceOverview(): Keys of oldKeySingleBalanceOverview, newKeySingleBalanceOverview ",oldKeySingleBalanceOverview, newKeySingleBalanceOverview, Object.keys(oldSingleBalanceOverview), Object.keys(newSingleBalanceOverview))
                if(oldKeySingleBalanceOverview === newKeySingleBalanceOverview){
                    //console.log("createOrUpdateBalanceOverview(): oldKeySingleBalanceOverview === newKeySingleBalanceOverview | ", oldKeySingleBalanceOverview, oldSingleBalanceOverview[Object.keys(oldSingleBalanceOverview)], newSingleBalanceOverview[Object.keys(newSingleBalanceOverview)] )
                    oldSingleBalanceOverview[Object.keys(oldSingleBalanceOverview)]  ===  newSingleBalanceOverview[Object.keys(newSingleBalanceOverview)] ? (notUpdated = true) : (oldBalanceOverview = oldSingleBalanceOverview)
                }
            })

            if(oldBalanceOverview) {
                //console.log("createOrUpdateBalanceOverview(): oldBalanceOverview", oldBalanceOverview)
                let objectToUpdate = {}
                let queryFilter = {}
                let keyforDb = "balanceOverview.$."+ Object.keys(newSingleBalanceOverview)[0];
                let keyforFilter = "balanceOverview."+ Object.keys(newSingleBalanceOverview)[0];
                objectToUpdate[keyforDb] = Object.values(newSingleBalanceOverview)[0];
                queryFilter["address"] = body.address;
                queryFilter[keyforFilter] = Object.values(oldBalanceOverview)[0];

                //console.log("createOrUpdateBalanceOverview(): queryFilter, objectToUpdate ", queryFilter,objectToUpdate)
                await collection
                    .findOneAndUpdate(queryFilter, { $set: objectToUpdate }, {upsert:true},
                    (err,resp)=>{
                        if(!err){
                            return res.status(200).json({
                                success:true,
                                message: `${body.address} balance overview aggiornata con nuovo item`
                            })
                        }
                        else {
                            console.log(err)
                            return res.status(400).json({
                                success:false,
                                message: `${body.address} ${err}`
                            }) 
                        }
                    })
            }
            else if (notUpdated){
                return res.status(200).json({
                    success:true,
                    message: `${body.address} balance overview non aggiornata`
                })
            }
            else {
                collection
                    .findOneAndUpdate({ address: body.address }, { $push: { balanceOverview:newSingleBalanceOverview} },
                    (err,resp)=>{
                        if(!err){
                            return res.status(200).json({
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
        }catch(err){
            console.log("CreateOrUpdateBalanceOverview(): Permutation failed: %s", err);
            res.status(400).json({
                error: err,
                success: false
            });
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
    let tokenList = body.tokenList[body.chainId].map((tokenAddress)=> {return tokenAddress.toLowerCase()})
    body.tokenList[body.chainId] = tokenList
	const collection = await getCollection('Users');
    const userFinded = await collection.findOne({ address: body.address })
    if(!userFinded.tokenList){

        await collection
            .findOneAndUpdate({ address: body.address },
                              { $set: { tokenList: tokenList } },
                              (err,resp)=>{
                                if(!err){
                                    return res.status(200).json({
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
        let newTokenListByChainId = [...userFinded.tokenList[body.chainId],...tokenList]
        userFinded.tokenList[body.chainId] = Array.from(new Set(newTokenListByChainId))

        await collection
        .findOneAndUpdate({ address: body.address },
                          { $set: { tokenList: userFinded.tokenList } },
                          (err,resp)=>{
                            if(!err){
                                return res.status(200).json({
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
                                return res.status(200).json({
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

    const body = req.body;
    body.tokenFrom = body.tokenFrom && body.tokenFrom.toLowerCase()
    body.tokenTo = body.tokenTo && body.tokenTo.toLowerCase()
    body.user = body.user && body.user.toLowerCase()
	const listRecord = [];
	listRecord.push(body);

    if(!body) {
		return res.status(400).json({
				success:false,
				error:'body mancante',
			})
	}
	const collection = await getCollection('Trades');
    const tradeFindedInBuy = await collection.find({user:body.user,tokenTo:body.tokenFrom,status:{$lt:100}}).toArray()
    let now = new Date();
    let pl = 0;
    
    let tradeFindendInBuyLocal = tradeFindedInBuy
    
    const calcPL = (buyTrade, sellTrade) => {
        //console.log(Number(sellTrade.amountIn), Number(sellTrade.priceFrom), Number(buyTrade.priceTo));
        return Number(sellTrade.amountIn) * (Number(sellTrade.priceFrom) - Number(buyTrade.priceTo));
    }

    const closeTrade = () => {
            
        let sellTrade = body;
        //console.log("SellTrade: %s",sellTrade);
        //tradeFindendInBuyLocal.forEach( (buyTrade)=>{
        for (let i = 0; i < tradeFindendInBuyLocal.length; i++){
            let buyTrade = tradeFindendInBuyLocal[i];
            //console.log("BuyTrade: %s",buyTrade);
            pl += calcPL(buyTrade, sellTrade);
            //console.log("PL: %s", pl);

            if(Number(sellTrade.amountIn) > Number(buyTrade.amountOut) && buyTrade.status !== 100){
                buyTrade.status = 100;
                buyTrade.closedDate = now;
                closeTrade();
            } else {
                buyTrade.status = buyTrade.status += ((sellTrade.amountIn / buyTrade.amountOut ) * 100);
                if(buyTrade.status > 98.8){
                    buyTrade.status = 100;
                    buyTrade.closedDate = now;
                }
                return;
            }
        }
            
                
        //})
    }
        
    const logProfitLoss = async (profitLoss) => {
        //console.log("PL: %s", profitLoss);
        let coll = await getCollection('TradeProfits');
        coll.insertOne({
            user: body.user,
            profitLoss: profitLoss,
            date: now
        });
    }

    closeTrade()
    logProfitLoss(pl)
        
    tradeFindendInBuyLocal.forEach( async(tradeBuySelled,i) => {
        if(tradeBuySelled.closedDate){
            await collection.findOneAndUpdate({user:tradeBuySelled.user, tokenTo:tradeBuySelled.tokenTo,status:{$lt:100}},
                { $set: { status:tradeBuySelled.status, closedDate:tradeBuySelled.closedDate  } },
                (err,resp)=>{
                  if(!err){
                      console.log("resp update ", resp)
                  }
                  else {
                      console.log("err update ", err)
                  }
                })

        }
        else {
            await collection.findOneAndUpdate({user:tradeBuySelled.user, tokenTo:tradeBuySelled.tokenTo,status:{$lt:100}},
                { $set: { status:tradeBuySelled.status} },
                (err,resp)=>{
                  if(!err){
                      console.log("resp update ", resp)
                  }
                  else {
                      console.log("err update ", err)
                  }
                })
        }
    })

    await collection.insertMany(listRecord, {safe:true}, (err,resp) => {
        if(!err){              
            return res.status(200).json({
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
    const tradesFormatted = []
    if(!body) {
		return res.status(400).json({
				success:false,
				error:'body mancante',
			})
	}

    const collection = await getCollection('Trades');

    const trades = await collection.find({user:body.address}).toArray();

    trades.map((trade)=>{
        trade.amountIn = new BigNumber(trade.amountIn).toNumber()
        trade.openAt = (trade.amountOut * trade.priceTo)
        trade.priceTo = Number(trade.priceTo)
        trade.tokenFrom = trade.tokenFrom
        trade.tokenTo = trade.tokenTo
        tradesFormatted.push(trade)
    })


    if(tradesFormatted.length >0){
        return res.status(200).json({
            created:true,
            data: tradesFormatted
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

    try{
        let address = body.address && body.address.toLowerCase();
        //console.log('getDashBoardData(): address: %s', address);
        const collection = await getCollection('Trades');
        const openedTrades = await collection.find({user:address,status:{$lt:100}}).toArray()
        let openedTradesFormatted = []

        let totalOpenTradesValue = 0;

        openedTrades.map((openedTrade)=> {
            let amountOutMultiplyForPrice = openedTrade.amountOut * openedTrade.priceTo;
            totalOpenTradesValue = totalOpenTradesValue += amountOutMultiplyForPrice; 
        })

        openedTrades.map((openedTrade)=>{
            openedTrade.amountIn = new BigNumber(openedTrade.amountIn).toNumber()
            openedTrade.openAt = (openedTrade.amountOut * openedTrade.priceTo)
            openedTrade.priceTo = Number(openedTrade.priceTo)
            openedTrade.pl = new BigNumber(Number(openedTrade.currentValue)).minus(Number(openedTrade.openAt)).toNumber() 
            openedTrade.pl_perc = ((Number(openedTrade.currentValue) - Number(openedTrade.openAt))/Number(openedTrade.openAt)*100)
            openedTrade.tokenFrom = openedTrade.tokenFrom
            openedTrade.tokenTo = openedTrade.tokenTo
            openedTradesFormatted.push(openedTrade)
        })

        if(openedTradesFormatted.length>0){
            //console.log("getDashBoardData(): openedTradesFormatted.length > 0");
            return res.status(200).json({
                created:true,
                data: {   
                    openedTrades:openedTradesFormatted,
                    totalOpenTradesValue:totalOpenTradesValue
                }
            })

        }
    }catch(err){
        res.status(400).json({
            err,
            message: 'Database error'
        });
    }


}

getProfitsLoss = async (req,res) => {

    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    const queryObject = url.parse(req.url, true).query;

    if(!queryObject.user) {
		return res.status(400).json({
				success:false,
				error: 'Missing user',
			})
	}

    try {
        const user = queryObject.user.toLowerCase();

        const collection = await getCollection('TradeProfits');
        const pls = await collection.find({user:user}).toArray();

        if(!pls || pls.length == 0){
            return res.status(200).json({
                success: true,
                data: {}
            });
        }

        pls.sort(function(a,b){
            return new Date(a.date) - new Date(b.date);
        });


        let start_date = moment(pls[0].date);
        let end_date = moment();
        let n_days = start_date.diff(end_date, 'days');

        if(n_days === 0)
            n_days = 1;
        
        if(! (pls.length > 0)){
            return res.status(200).json({
                success:true,
                data: []
            })
        }

        let pls_formatted = new Map();
        pls.forEach((pl_item) => {
            let k = replaceAll(new Date(pl_item.date).toISOString().split('T')[0], '-', '/');
            if(pls_formatted.has(k)){
                pls_formatted.set(k, pls_formatted.get(k) + pl_item.profitLoss );
            }else{
                pls_formatted.set(k, pl_item.profitLoss);
            }
        })

        let pls_obj = Object.fromEntries(pls_formatted);
        let dates = [];

        for (let i = 0; i < n_days; i++) {
            let date = moment();
            date.subtract(i, 'day');
            let d = date.format('YYYY/MM/DD');
            dates.push(d);
        }

        let finalResult = {};
        dates.reverse().forEach(date => {
            if(!pls_obj.hasOwnProperty(date)) {
                finalResult[date] = 0;
            } else {
                finalResult[date] = pls_obj[date];
            }
        });

        let asArray = Object.entries(finalResult);
        if(asArray.length > 0)
            for(let j = 1; j < asArray.length; j++) {
                asArray[j][1] += asArray[j-1][1]
            }

        let parsed = asArray.map(el => {
            return {
                [el[0]]: el[1]
            }
        });

        return res.status(200).json({
            success: true,
            data: parsed
        });

    }catch(err) {
        console.log(err);
        return res.status(400).json({
            success: false,
            message: 'An error occurred, please try again later.'
        });
    }
}

module.exports = {
	createOrUpdateUser,
    createOrUpdateBalanceOverview,
    updateUserTokenList,
    insertOrUpdateTrades,
    getTrades,
    getDashboardData,
    getFiats,
    getProfitsLoss
}
