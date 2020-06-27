const express = require('express');
const router = express.Router();
const fs = require('fs');

function readCommentsByArticle(articleId){
    const comments = JSON.parse(fs.readFileSync('./db/comments.json').toString());
    return comments.filter(function(comment){
        return comment.articleId === articleId;
    });
}

function readComments(articleId){
    const comments = JSON.parse(fs.readFileSync('./db/comments.json').toString());
        return comments;
}

function getLatestIdByComments(){
    const comments = readComments();
    comments.sort(function(n1, n2){
        return n2.id - n1.id;
    });
    return (comments[0] && comments[0].id || 0 ) + 1;
};

function usersRead() {// json을 불러오는 함수다.
    //readFileSync로 json파일을 읽고 버퍼로 리턴된 값을 string로 리턴하고 json으로 파싱
    const users = JSON.parse(fs.readFileSync("./db/users.json").toString());
    users.sort(function(n1, n2) {
        return n2.id - n1.id; //내림차순(큰수부터) 정렬
    });
    return users;
}

function writeComment(contents, identity, articleId, req){
    const users = usersRead();
    const comments = readComments();
    const id = getLatestIdByComments();
    //날짜 추가
    const createdAt = new Date().getTime();
    const comment = {
        id,
        contents,
        identity,
        articleId,
        createdAt
    };
    const user = users.filter(function(point){//filter는 배열을 반환
        return point.identity === identity;
    })[0];
    if(user){
        user.point += 50;
        req.session.userInfo = user;
        fs.writeFileSync('./db/users.json', JSON.stringify(users, null, 2));
    }
    comments.unshift(comment);
    fs.writeFileSync('./db/comments.json',JSON.stringify(comments, null, 2));
    return id;
}

function deleteComment(commentId, identity){
    const comments = readComments();
    const comment = comments.filter(function(comment){
        return comment.id === commentId && comment.identity === identity;
    })[0];
    if(comment){
        const commentsWithoutOne = comments.filter(function(comment){
            return comment.id !== commentId;
        });
        fs.writeFileSync('./db/comments.json', JSON.stringify(commentsWithoutOne, null, 2));
    }
}

router.get('/article/:articleId/comments', function(req, res){
    if(!req.session.userInfo){
        return res.status(401).send("Unauthorized");
    }
    const articleId = parseInt(req.params.articleId);
    res.json(readCommentsByArticle(articleId));
});

// Comment 생성 API
router.post('/article/:articleId/comments', function(req, res){
    if(!req.session.userInfo){
        return res.status(401).send("Unauthorized");
    }
    const articleId = parseInt(req.params.articleId);
    const contents = req.body.contents;
    writeComment(contents, req.session.userInfo.identity, articleId, req);
    res.send("Success");
});

// comment 삭제 API
router.delete('/comment/:commentId', function(req, res){
    if(!req.session.userInfo){
        return res.status(401).send("Unauthorized");
    }
    deleteComment(parseInt(req.params.commentId), req.session.userInfo.identity);
    res.send("Success");
});

console.log(readComments(0));

module.exports = router;//이걸로 인해 app.js에서 req로 불러올수있음