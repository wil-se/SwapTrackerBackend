require('dotenv').config({
	path: '/home/ubuntu/SwapTrackerBackend/.env'
});
const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const recordsRouter = require('./db/routes/records-router');

const PORT = 3333;
const KEY = "/etc/letsencrypt/live/dev.swaptracker.io-0001/privkey.pem";
const CERT = "/etc/letsencrypt/live/dev.swaptracker.io-0001/fullchain.pem"

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
	res.send('Sto runnando...... ')
})

app.use('/data', recordsRouter)

https.createServer({
    key: fs.readFileSync(KEY),
    cert: fs.readFileSync(CERT),
    passphrase: 'swaptracker'
}, app).listen(PORT);
