const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const app = express();
const bodyParser = require('body-parser');
const superagent = require('superagent');

/* GET users listing. */
 //Create application/x-www-form-urlencoded parser
//let urlencodedParser = bodyParser.urlencoded({ extended: false })

//const passport = require('passport');
//var GoogleStrategy = require( 'passport-google-oauth20' ).Strategy

// router.get('/auth', function)

const client_id = "ZFX1wc4NMNgNeOoS1TLkxD91Y5nDFD7fY9k85d4t";
const redirectURI = "http://localhost:3000";
const scope = "login inquiry transfer";
const client_info = "12345678901234567890123456789012";
const state = "12345678901234567890123456789012";
const auth_type = "0";

router.get('/', function(req, res) {
  api_url = 'https://testapi.openbanking.or.kr/oauth/2.0/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=' + redirectURI + '&scope=' + scope + '&client_info=' + client_info + '&state=' + state + '&auth_type=' + auth_type;
   res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
   res.end("<a href='"+ api_url + "'><img height='50' src='http://static.nid.naver.com/oauth/small_g_in.PNG'/></a>");

});

module.exports = router;
