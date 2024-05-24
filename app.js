const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const usersFilePath = 'users.json';
const postsFilePath = 'posts.json';
const port = 3000;
const { v4: uuidv4 } = require('uuid');
const limit = 3;
function refreshAccessCount() {
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(401).json({ message: 'Вход не выполнен.' });
            return;
        }
        var users = JSON.parse(data);
        for (var i=0; i<users.length; i++)
            {
                users[i].callsLeft=limit;
            }
            fs.writeFile(usersFilePath, JSON.stringify(users), (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Не удалось обновить право доступа.' });
                return;
            }
        })
    })
}
setTimeout(() => {
    refreshAccessCount();
}, 900000);
app.use(express.static('.'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/page', (req, res) => {
    res.sendFile(__dirname + '/page.html');
});

app.get('/api', (req, res) => {
    res.json({ message: 'Добро пожаловать в систему для 11 работы REST API!' });
});

app.post('/register', bodyParser.json(), (req, res) => {
    const { username, password } = req.body;
    const newUser = { id: uuidv4(), username, password, callsLeft: limit };

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка регистрации.' });
            return;
        }
        let users = JSON.parse(data);
        users.push(newUser);

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Ошибка регистрации.' });
                return;
            }

            console.log('Зарегестрирован пользователь:', newUser);
            res.json({ message: 'Успех!' });
        });
    });
});

app.post('/login', bodyParser.json(), (req, res) => {
    const { username, password } = req.body;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Вход не выполнен.' });
            return;
        }

        const users = JSON.parse(data);
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            const { id, username } = user; // Extract user ID and name
            res.redirect(`/page?id=${id}&name=${username}`); // Redirect to page.html with user ID and name
        } else {
            res.status(401).json({ message: 'Вход не выполнен. Неправильное имя или пароль.' });
        }
    });
});
app.get('/logoff', bodyParser.json(), (req, res) => {
    res.redirect(`/`);
});

app.get('/get-users-posts/:aid/:uid', (req, res) => {
    var uid = req.params.uid;
    console.log(uid);
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(401).json({ message: 'Вход не выполнен.' });
            return;
        }
        const users = JSON.parse(data);
        const user = users.find(u => u.id == uid);
        if (!user) {
            res.status(500).json({ message: 'Ошибка идентификации пользователя. Ваш id не действителен.' });
            return;
        }
        if (user.callsLeft <= 0) {
            res.status(500).json({ message: 'Большое количество запросов. Попробуйте позже.' });
            return;
        }
        user.callsLeft--;
        users.map(usr => users.find(u => u.id === uid) || user);
        fs.writeFile(usersFilePath, JSON.stringify(users), function writeJSON(err) {
            if (err) return console.log(err);
        });
        var id = req.params.aid;
        console.log(id);
        fs.readFile(postsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Ошибка при получении постов.' });
                return;
            }
            var userPosts = [];
            const posts = JSON.parse(data);
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].author_id == id) {
                    console.log(posts[i]);
                    userPosts.push(posts[i]);
                }
            }
            res.json(userPosts);
        });
    });
});
app.post('/create-post:uid', bodyParser.json(), (req, res) => {
    var id = req.params.uid;
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Вход не выполнен.' });
            return;
        }
        const users = JSON.parse(data);
        const user = users.find(u => u.id == id);
        if (!user) {
            res.status(401).json({ message: 'Ошибка идентификации пользователя. Ваш id не действителен.' });
            return;
        }
        if (user.callsLeft <= 0) {
            res.status(500).json({ message: 'Большое количество запросов. Попробуйте позже.' });
            return;
        }
        user.callsLeft--;
        users.map(usr => users.find(u => u.id === id) || user);
        fs.writeFile(usersFilePath, JSON.stringify(users), function writeJSON(err) {
            if (err) return console.log(err);
        });
        const author_id = req.body.authorId;
        if (limit <= 0) {
            console.error(err);
            res.status(500).json({ message: 'Слишком много постов за раз. Попробуйте позже' });
            return;
        }
        else {
            prev_user = author_id;
            const { title, content } = req.body;
            const author = req.body.author; // Get the author from the request body let nextId = 1;
            fs.readFile(postsFilePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ message: 'Ошибка при создании поста.' });
                    return;
                }

                let posts = JSON.parse(data);
                let nextId = 1;
                if (posts.length > 0) {
                    nextId = posts[posts.length - 1].id + 1; // Generate the next ID based on the last post's ID
                }

                const newPost = { id: nextId, title, author, author_id, content };
                posts.push(newPost);

                fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ message: 'Пост не создан.' });
                        return;
                    }

                    console.log('Создан новый пост:', newPost);
                    res.json({ message: 'Пост создан!', post: newPost });
                });
            });
        }
    })
});

app.get('/get-posts:uid', (req, res) => {
    var id = req.params.uid;
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Вход не выполнен.' });
            return;
        }
        const users = JSON.parse(data);
        const user = users.find(u => u.id == id);
        if (!user) {
            res.status(401).json({ message: 'Ошибка идентификации пользователя. Ваш id не действителен.' });
            return;
        }
        if (user.callsLeft <= 0) {
            res.status(500).json({ message: 'Большое количество запросов. Попробуйте позже.' });
            return;
        }
        user.callsLeft--;
        users.map(usr => users.find(u => u.id === id) || user);
        fs.writeFile(usersFilePath, JSON.stringify(users), function writeJSON(err) {
            if (err) return console.log(err);
        });
        fs.readFile(postsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Ошибка при получении постов.' });
                return;
            }

            const posts = JSON.parse(data);
            res.json(posts);
        });
    })
});

app.delete('/delete-post/:postId/:uid', (req, res) => {
    var id = req.params.uid;
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Вход не выполнен.' });
            return;
        }
        const users = JSON.parse(data);
        const user = users.find(u => u.id == id);
        if (!user) {
            res.status(401).json({ message: 'Ошибка идентификации пользователя. Ваш id не действителен.' });
            return;
        }
        if (user.callsLeft <= 0) {
            res.status(401).json({ message: 'Большое количество запросов. Попробуйте позже.' });
            return;
        }
        user.callsLeft--;
        users.map(usr => users.find(u => u.id === id) || user);
        fs.writeFile(usersFilePath, JSON.stringify(users), function writeJSON(err) {
            if (err) return console.log(err);
        });
        const postId = parseInt(req.params.postId, 10);
        const urlRed = req.headers.referer;
        fs.readFile(postsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Пост не удалён.' });
                return;
            }

            let posts = JSON.parse(data);
            const postIndex = posts.findIndex(post => post.id === postId);
            console.log(postIndex);
            if (postIndex !== -1) {
                const deletedPost = posts.splice(postIndex, 1)[0];

                fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ message: 'Пост не удалён.' });
                        return;
                    }
                    console.log('Пост удалён:', deletedPost);
                    res.json({ message: 'Пост удалён!', redirectUrl: urlRed });
                });
            } else {
                res.status(404).json({ message: 'Не найдено.' });
                console.log(postId);
            }
        });
    })
});

app.put('/change-post/:postId/:uid', bodyParser.json(), (req, res) => {
    var id = req.params.uid;
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Вход не выполнен.' });
            return;
        }
        const users = JSON.parse(data);
        const user = users.find(u => u.id == id);
        if (!user) {
            res.status(401).json({ message: 'Ошибка идентификации пользователя. Ваш id не действителен.' });
            return;
        }
        if (user.callsLeft <= 0) {
            res.status(401).json({ message: 'Большое количество запросов. Попробуйте позже.' });
            return;
        }
        user.callsLeft--;
        users.map(usr => users.find(u => u.id === id) || user);
        fs.writeFile(usersFilePath, JSON.stringify(users), function writeJSON(err) {
            if (err) return console.log(err);
        });
        const postId = parseInt(req.params.postId, 10);
        const { title, content } = req.body;
        const urlRed = req.headers.referer;

        fs.readFile(postsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Ошибка при изменении поста.' });
                return;
            }

            let posts = JSON.parse(data);
            const postIndex = posts.findIndex(post => post.id === postId);

            if (postIndex !== -1) {
                posts[postIndex].title = title;
                posts[postIndex].content = content;

                fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ message: 'Ошибка при изменении записи.' });
                        return;
                    }

                    console.log('Пост изменён:', posts[postIndex]);
                    res.json({ message: 'Запись успешно изменена!', post: posts[postIndex], redirectUrl: urlRed });
                });
            } else {
                res.status(404).json({ message: 'Не найдено.' });
            }
        });
    })
});



app.listen(port, () => {
    console.log(`Подключение по http://localhost:${port}`);
});