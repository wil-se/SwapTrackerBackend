const express = require('express')

const RecordsCtrl = require('../controller/records-ctrl')

const router = express.Router()

router.post('/createOrUpdateUser', RecordsCtrl.createOrUpdateUser)
router.post('/createOrUpdateUserTokenList', RecordsCtrl.createOrUpdateUserTokenList)

module.exports = router
