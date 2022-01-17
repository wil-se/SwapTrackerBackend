const express = require('express')

const RecordsCtrl = require('../controller/records-ctrl')

const router = express.Router()

router.post('/createOrUpdateUser', RecordsCtrl.createOrUpdateUser)
router.post('/updateUserTokenList', RecordsCtrl.updateUserTokenList)
router.post('/insertOrUpdateTrade',RecordsCtrl.insertOrUpdateTrades)
router.post('/getTrades',RecordsCtrl.getTrades)

module.exports = router
