require('dotenv').config({
	path: '/home/ubuntu/SwapTrackerBackend/.env'
});
const { MongoClient } = require('mongodb');
const axios = require('axios').default;

const run = async () => {
  const client = new MongoClient(process.env.DB_URL);
  await client.connect();
  var dbo = await client.db("Cluster0");
  const prices = await dbo.collection("FiatPrices");

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

  axios.get(`https://${hostname}${path}`)
  .then(function (data) {
    for(var rate in data['data']['rates']){
      const query = {currency: rate};
      const update = { $set: { currency: rate, timestamp: data['data']['timestamp'], date: data['data']['date'], rate: data['data']['rates'][rate] }};
      const options = {upsert: true};
      prices.updateOne(query, update, options);
    }
  })
  .catch(function (error) {
    console.log(error);
    process.exit(1);
  })
  .then(function(){
    process.exit(0);
  })
}


run()
