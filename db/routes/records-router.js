const express = require('express')

const RecordsCtrl = require('../controller/records-ctrl')

const router = express.Router()

router.post('/createOrUpdateUser', RecordsCtrl.createOrUpdateUser)
router.post('/updateUserTokenList', RecordsCtrl.updateUserTokenList)
router.post('/insertTrade',RecordsCtrl.insertTrades)

module.exports = router
