require('dotenv').config({
	path: '/home/ubuntu/SwapTrackerBackend/.env'
});

const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const recordsRouter = require('./db/routes/records-router');

const PORT = 3000;

console.log("init api")

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
	res.send('Sto runnando...... ')
})
app.use('/data', recordsRouter)

https.createServer(app).listen(PORT);
