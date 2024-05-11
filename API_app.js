var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
const { MongoClient } = require('mongodb');
const { request } = require('http');
var app = express();
var jsonParser = bodyParser.json();
var User = require('./ourApi');
const { constrainedMemory } = require("process");

const urlencodedParser = express.urlencoded({extended: false});
User.id= null;
User.name = '';
User.pass= '';
    User.logged= false;
app.get("/", function (req, res) {
    res.sendFile(process.cwd() + '/index.html');
});
app.use(express.static(__dirname + "/public"));
// получение списка данных
app.get("/api/posts", function (req, res) {
    var content = fs.readFileSync("posts.json", "utf8");
    var posts = JSON.parse(content);
    res.send(posts);
});
// получение одного пользователя по id
app.get("/api/posts/:id", function (req, res) {

    var id = req.params.id; // получаем id
    var content = fs.readFileSync("posts.json", "utf8");
    var posts = JSON.parse(content);
    var post = null;
    // находим в массиве пользователя по id
    for (var i = 0; i < posts.length; i++) {
        if (posts[i].id == id) {
            post = posts[i];
            break;
        }
    }
    // отправляем пользователя
    if (post) {
        res.send(post);
    }
    else {
        res.status(404).send();
    }
});
// получение отправленных данных
app.post("/api/posts", jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    var postTitle = req.body.title;
    var postText = req.body.text;
    var post = { title: postTitle, text: postText };

    var data = fs.readFileSync("posts.json", "utf8");
    var posts = JSON.parse(data);

    // находим максимальный id
    var id = Math.max.apply(Math, posts.map(function (o) { return o.id; }))
    // увеличиваем его на единицу
    post.id = id + 1;
    // добавляем пользователя в массив
    posts.push(post);
    var data = JSON.stringify(posts);
    // перезаписываем файл с новыми данными
    fs.writeFileSync("posts.json", data);
    res.send(post);
});
// удаление пользователя по id
app.delete("/api/posts/:id", function (req, res) {

    var id = req.params.id;
    var data = fs.readFileSync("posts.json", "utf8");
    var posts = JSON.parse(data);
    var index = -1;
    // находим индекс пользователя в массиве
    for (var i = 0; i < posts.length; i++) {
        if (posts[i].id == id) {
            index = i;
            break;
        }
    }
    if (index > -1) {
        // удаляем пользователя из массива по индексу
        var post = posts.splice(index, 1)[0];
        var data = JSON.stringify(posts);
        fs.writeFileSync("posts.json", data);
        // отправляем удаленного пользователя
        res.send(post);
    }
    else {
        res.status(404).send();
    }
});
// изменение пользователя
app.put("/api/posts", jsonParser, function (req, res) {

    if (!req.body) return res.sendStatus(400);

    var postId = req.body.id;
    var postTitle = req.body.title;
    var postText = req.body.text;

    var data = fs.readFileSync("posts.json", "utf8");
    var posts = JSON.parse(data);
    var post;
    for (var i = 0; i < posts.length; i++) {
        if (posts[i].id == postId) {
            post = posts[i];
            break;
        }
    }
    // изменяем данные у пользователя
    if (post) {
        post.text = postText;
        post.title = postTitle;
        var data = JSON.stringify(posts);
        fs.writeFileSync("posts.json", data);
        res.send(post);
    }
    else {
        res.status(404).send(post);
    }
});

app.get("/register", function (req, res) {
    res.sendFile(process.cwd() + '/register.html');
})
app.get("/auth", function (req, res) {
    res.sendFile(process.cwd() + '/auth.html');
})
app.post("/registerSubmit",urlencodedParser, function (req, res) {
    var userName = req.body.name;
    var userPass = req.body.pass;
    var user = { name: userName, pass: userPass };
    var data = fs.readFileSync("users.json", "utf8");
    var users = JSON.parse(data);
    var id = Math.max.apply(Math, users.map(function (o) { return o.id; }))
    user.id = id + 1;
    users.push(user);
    var data = JSON.stringify(users);
    fs.writeFileSync("users.json", data);
    res.redirect("/auth");
})
app.post("/authCheck", urlencodedParser, function(req,res){
    var userName = req.body.name;
    var userPass = req.body.pass;
    var content = fs.readFileSync("users.json", "utf8");
    for(var i=0; i<content.length; i++)
        {
            if((userName==content[i].name)&&(userPass==content[i].pass))
                {
                    User.id=content[i].id;
                    User.name=content[i].name;
                    User.pass=content[i].pass;
                    User.logged=true;
                    break;
                }
        }
    res.redirect("/");
});
app.listen(3000, function () {
    console.log("Сервер ожидает подключения...");
});