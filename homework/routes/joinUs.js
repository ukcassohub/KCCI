var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  if(req.session.userInfo){
    return res.render('joinUs',{title:'성공', userInfo: req.session.userInfo});
  }
  res.render('article', { title: 'GREENPERSON' });//render는 한번만 실행되야해서
  //리턴으로 한번만 되게한다.
});

module.exports = router;
