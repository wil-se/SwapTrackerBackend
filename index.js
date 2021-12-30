require('dotenv/config');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const recordsRouter = require('./db/routes/records-router')
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));



app.get('/', (req, res) => {
	res.send('Sto runnando...... ')
})

app.use('/data',recordsRouter)

app.listen(8080,()=>{

	console.log("listening...");
})
