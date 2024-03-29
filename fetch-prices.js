require('dotenv').config({ path: `${__dirname}/.env`})

const {getCollection} = require('./db/dataModels/dataModel')
const axios = require('axios').default;

const run = async () => {

  try{
    const prices = await getCollection("FiatPrices");
  
    var symbols = [
        "USD",
        "EUR",
        "CNY",
        "INR",
        "CAD",
        "GBP",
        "JPY",
        "RUB",
        "MXN",
        "CHF",
        "KRW",
        "TRY",
        "BRL",
        "SEK",
        "HKD",
        "AUD",
        "NOK",
        "SGD",
        "BTC",
    ]

    var hostname = 'data.fixer.io';
    var path = `/api/latest?access_key=${process.env.API_KEY}&base=USD&symbols=${symbols.join(",")}&format=1`;

    let data = await axios.get(`https://${hostname}${path}`);

    for(var rate in data['data']['rates']){
      const query = {currency: rate};
      const update = { $set: { currency: rate, timestamp: data['data']['timestamp'], date: data['data']['date'], rate: data['data']['rates'][rate] }};
      const options = {upsert: true};
      await prices.updateOne(query, update, options);
    }
    return 0;

  } catch(e){
    console.log(e);
    return 1;
  }
}

run().then(() => {
  console.log("FiatPrices successfully updated.");
  process.exit(0);
})
