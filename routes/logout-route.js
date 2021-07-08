const express = require('express')
const router = express.Router()

/* GET logout */
router.get('/logout', function(req, res, next) {
    req.session.destroy()
    res.redirect('/user/login')
});

module.exports = router;
