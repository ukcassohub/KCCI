const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');


function findOne(identity){
  const users = readUsers();
  const selectedUser = users.filter(function(user){
    return identity === user.identity;
  })[0];
  return selectedUser;
}

function findOneByNick(nickname){
  const users = readUsers();
  const selectedUser = users.filter(function(user){
    return nickname ===user.nickname;
  })[0];
  return selectedUser;
}


function createUser(identity, password, nickname, email, createdAt, bankname, cellphone, bankaccount, refid){
  const user = {
    identity,
    password,
    nickname,
    email,
    createdAt,
    bankname,
    cellphone,
    bankaccount,
    refid
    
  };
  const users = readUsers();
  users.push(user);
  fs.writeFileSync('./db/users.json', JSON.stringify(users, null, 2))
}

function readUsers(){
  const users = JSON.parse(fs.readFileSync('./db/users.json').toString());//파일읽고 스트링으로 변환하고 제이슨객체로 파싱
  return users;
}

function encryptStr(str, salt){
  return crypto.pbkdf2Sync(str, salt, 5658, 256, 'sha256').toString('hex');
//  return crypto.createHash('sha256').update(str).digest('hex');
}


router.post('/login', function(req, res){
  const identity = req.body.identity;
  const selectedUser = findOne(identity);

  if(selectedUser){
    const password = encryptStr(req.body.password, selectedUser.createdAt.toString());    
    if(selectedUser.password === password){
      req.session.userInfo={
        ...selectedUser//...은 스프레드 연산자(펼친다)...은 노드.js에서만하는게 좋다
      };
      return res.send("Success");
    }
  }
  
    //어떤 속성값이 일치하는 것들로 한정시켜줄때 filter map이랑 사용방법비슷
  //필터는 원본데이터랑 같은 배열로 리턴
  res.status(401).send("Bad Authorization")
});//createHasg해시함수 만들고 update 바디에 업데이트 digest결과산출
/* GET users listing. */
//router.get('/set/session', function(req, res){
//  req.session.identity = 'admin';
//  res.send("Success");
//})
//router.get('/session', function(req, res){
//  res.send(req.session.identity);
//});
router.post('/logout', function(req, res, _next){
  req.session.userInfo = undefined;
  res.send("Success");
});
router.get('/', function(_req, res, _next) {
  res.send('respond with a resource');
});

router.post('/create', function(req, res){
  const identity = req.body.identity;
  const password = req.body.password;
  const nickname = req.body.nickname;
  const email = req.body.email || '';
  const bankaccount = req.body.bankaccount;
  const bankname = req.body.bankname;
  const cellphone = req.body.cellphone;
  const refid = req.body.refid || '';
  
  if (!identity || !password || !nickname){
    return res.status(400).send("Some parameter lost");
  }
  if(password.length <= 6){
    return res.status(400).send("Not enough pw length")
  };
  //아래부터 중복검사
  const existUser = findOne(identity);
  const existUserByNick = findOneByNick(nickname);
  if(existUser || existUserByNick){
    return res.status(400).send("Identity or nickname is already exist")
  }
  const createdAt = new Date().getTime();
  createUser(identity, encryptStr(password, createdAt.toString()), nickname, email, createdAt, bankname, cellphone, bankaccount, refid);
  res.send("Sucess");
});

module.exports = router;