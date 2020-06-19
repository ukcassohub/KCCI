const express = require('express');
const router = express.Router();
const fs = require('fs');

//utils 추가
//const {
//    modifyPoint,
//    readUsers,
//    findOne
//} = require('./utils');

//multer추가
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

function readUsers(){
    const users = JSON.parse(fs.readFileSync('./db/users.json').toString());//파일읽고 스트링으로 변환하고 제이슨객체로 파싱
    return users;
  }
  
  function findOne(identity){
    const users = readUsers();
    const selectedUser = users.filter(function(user){
      return identity === user.identity;
    })[0];
    return selectedUser;
  }

function readArticles(){
    const articles = JSON.parse(fs.readFileSync("./db/articles.json").toString());
    articles.sort(function(n1, n2){
        return n2.id - n1.id;//내림차순
    });
    return articles;
}

function getLatestIdByArticles(articles){
    articles.sort(function(n1, n2){
        return n2.id - n1.id;//내림차순
    });
    const foundArticle = articles[0];
    return foundArticle && (foundArticle.id + 1) || 0;// 있으면 다음줄 없으면 0   ? : 삼항연산자 써도 됌
}

function usersRead() {// users.json을 불러오는 함수다.
    //readFileSync로 json파일을 읽고 버퍼로 리턴된 값을 string로 리턴하고 json으로 파싱
    const users = JSON.parse(fs.readFileSync("./db/users.json").toString());
    users.sort(function(n1, n2) {
        return n2.id - n1.id; //내림차순(큰수부터) 정렬
    });
    return users;
}

function writeArticle(title, contents, identity, req){
    const users = usersRead();
    const articles = readArticles();
    const id = getLatestIdByArticles(articles);
    const createdAt = new Date().getTime();
    const article = {
        id,
        title,
        contents,
        createdAt,
        identity,
    };
    const user = users.filter(function(point){//filter는 배열을 반환
        return article.identity === identity;
    })[0];
    if(user){
        user.point += 100;
        req.session.userInfo = user;
        fs.writeFileSync('./db/users.json', JSON.stringify(users, null, 2));
    }
    articles.unshift(article);
    fs.writeFileSync('./db/articles.json',JSON.stringify(articles, null, 2));
    return id;
}

function modifyArticle(id, title, contents, identity){
    const articles = readArticles();
    const article = articles.filter(function(article){//filter는 배열을 반환
        return article.id === id &&
               article.identity === identity;

    })[0];
    if(article){
        article.title = title;
        article.contents = contents;
        fs.writeFileSync('./db/articles.json', JSON.stringify(articles, null, 2));
    }
}


function deleteArticle(id, identity){
    const articles = readArticles();
    const article = articles.filter(function(article){
        return article.id === id && article.identity === identity
    })[0];
    if (article){
        const articlesWithoutOne = articles.filter(function(article){//filter는 배열을 반환
            return article.id !== id;
    });
    fs.writeFileSync('./db/articles.json', JSON.stringify(articlesWithoutOne, null, 2));
    }
}

router.get('/', function(req, res){
    if(!req.session.userInfo){
        return res.status(401).send("Unauthorized");
    }
    res.render('article', { title: '게시판', userInfo: req.session.userInfo });
});

router.get('/articles', function(req, res){
    if(!req.session.userInfo){
        return res.status(401).send("Unauthorized");
    }
    res.json(readArticles());
    
});

//게시글 생성 API
router.post('/articles', upload.single("attachment"), function(req, res){
    if(!req.session.userInfo){
        return res.status(401).send("Unauthorized");
    }
    console.log(req.file);
    const title = req.body.title;
    const contents = req.body.contents;
    const identity = req.session.userInfo.identity;
    const createdId = writeArticle(title, contents, identity, req);
    
    //createdid를 기반으로 dir생성
    if(req.file){
        const uploadPath = req.file.destination;
        const originalname = req.file.originalname;
        const savePath = uploadPath+createdId 
        fs.mkdirSync(savePath);
        fs.renameSync(req.file.path, savePath + '/' + originalname);//req.file.path의 파일이름을 , 뒤로 변경하겠다.
    }
    res.send("Success");//기본적으로 200코드로 전송
});//게시글 생성 api만들어짐

router.put('/article/:articleId', function(req, res){
    if(!req.session.userInfo){
        return res.status(401).send("Unauthorized");
    }
    const articleId = parseInt(req.params.articleId);//parseInt로 정수로 변환해줘야 됌 형의 차이로 오류잡아줌
    const title = req.body.title;
    const contents = req.body.contents;
    const identity = req.session.userInfo.identity;
    modifyArticle(articleId, title, contents, identity)
    res.send("Success");
});

router.delete('/article/:articleId', function(req, res){
    if(!req.session.userInfo){
        return res.status(401).send("Unauthorized");
    }
    const articleId = parseInt(req.params.articleId);
    const identity = req.session.userInfo.identity;
    deleteArticle(articleId, identity);
    res.send("Success");
});

//첨부파일 불러오는 API
router.get('/article/:articleId/attachment', function(req, res){
    if(!req.session.userInfo){
        return res.status(401).send("Unauthorized");
    }
    const id = parseInt(req.params.articleId);
    try{
        const result = fs.readdirSync('uploads/'+id);
        const file = result[0];
        res.send(file)
    }catch(err){
        res.send("")
    }
    
});

function usersRead() {// json을 불러오는 함수다.
    //readFileSync로 json파일을 읽고 버퍼로 리턴된 값을 string로 리턴하고 json으로 파싱
    const users = JSON.parse(fs.readFileSync("./db/users.json").toString());
    users.sort(function(n1, n2) {
        return n2.id - n1.id; //내림차순(큰수부터) 정렬
    });
    return users;
}
//파일 다운로드하는 API
router.get('/article/:articleId/download/attachment', function(req, res){
    if(!req.session.userInfo){
        return res.status(401).send("Unauthorized");
    }
    if(req.session.userInfo.point<200){
        res.status(400).send('Not enough')
        return;
    }
    const users = JSON.parse(fs.readFileSync("./db/users.json").toString());
    const user = users.filter(function(user){
        return user.identity === req.session.userInfo.identity;
    })[0];

    user.point -= 200;
    req.session.userInfo = user;
    fs.writeFileSync('./db/users.json', JSON.stringify(users, null, 2));


    const id = parseInt(req.params.articleId);
    try{
        const result = fs.readdirSync('uploads/'+id);
        const file = result[0];
        const path = require('path');
        const fullpath = path.join(__dirname + '/../uploads/'+id+'/'+file);

        res.set("Content-Disposition", "attachment;filename="+file);//굳이 없어도됌
        res.download(fullpath, file);

        return id;
    }catch(err){
        console.log(err);
        res.status(400).send('Bad Request')
    }
});

module.exports = router;//이걸로 인해 app.js에서 req로 불러올수있음