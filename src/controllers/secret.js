const express = require('express')

module.exports = {

    async secret (req, res) {
        res.send(JSON.stringify(req['tokenData']))
    }
}