const express = require('express')

const RecordsCtrl = require('../controller/records-ctrl')

const router = express.Router()

router.post('/createUser', RecordsCtrl.createUser)

module.exports = router
