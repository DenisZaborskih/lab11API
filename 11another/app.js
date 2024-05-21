const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const usersFilePath = 'users.json';
const postsFilePath = 'posts.json';
const port = 3000;
const { v4: uuidv4 } = require('uuid');

app.use(express.static('.'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/page', (req, res) => {
    res.sendFile(__dirname + '/page.html');
});

app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to your simple API!' });
});

app.post('/register', bodyParser.json(), (req, res) => {
    const { username, password } = req.body;
    const newUser = { id: uuidv4(), username, password };

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error registering user.' });
            return;
        }
        let users = JSON.parse(data);
        users.push(newUser);

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Error registering user.' });
                return;
            }

            console.log('New user registered:', newUser);
            res.json({ message: 'Registration successful!' });
        });
    });
});

app.post('/login', bodyParser.json(), (req, res) => {
    const { username, password } = req.body;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error authenticating user.' });
            return;
        }

        const users = JSON.parse(data);
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            const { id, username } = user; // Extract user ID and name
            res.redirect(`/page?id=${id}&name=${username}`); // Redirect to page.html with user ID and name
        } else {
            res.status(401).json({ message: 'Authentication failed. Invalid username or password.' });
        }
    });
});



app.post('/create-post', bodyParser.json(), (req, res) => {
    const { title, content } = req.body;
    const author = req.body.author; // Get the author from the request body let nextId = 1;

    fs.readFile(postsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error creating post.' });
            return;
        }

        let posts = JSON.parse(data);
        let nextId = 1;
        if (posts.length > 0) {
            nextId = posts[posts.length - 1].id + 1; // Generate the next ID based on the last post's ID
        }

        const newPost = { id: nextId, title, author, content };
        posts.push(newPost);

        fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Error creating post.' });
                return;
            }

            console.log('New post created:', newPost);
            res.json({ message: 'Post created successfully!', post: newPost });
        });
    });
});

app.get('/get-posts', (req, res) => {
    fs.readFile(postsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error retrieving posts.' });
            return;
        }

        const posts = JSON.parse(data);
        res.json(posts);
    });
});

app.delete('/delete-post/:postId', (req, res) => {
    const postId = parseInt(req.params.postId, 10); 
    const urlRed = req.headers.referer;
    fs.readFile(postsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error deleting post.' });
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
                    res.status(500).json({ message: 'Error deleting post.' });
                    return;
                }

                console.log('Post deleted:', deletedPost);
                res.json({ message: 'Post deleted successfully!', redirectUrl: urlRed });
            });
        } else {
            res.status(404).json({ message: 'Post not found.' });
            console.log(postId);
        }
    });
});

app.put('/change-post/:postId', bodyParser.json(), (req, res) => {
    const postId = parseInt(req.params.postId, 10);
    const { title, content } = req.body;
    const urlRed = req.headers.referer;

    fs.readFile(postsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error changing post.' });
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
                    res.status(500).json({ message: 'Error changing post.' });
                    return;
                }

                console.log('Post changed:', posts[postIndex]);
                res.json({ message: 'Post changed successfully!', post: posts[postIndex], redirectUrl: urlRed });
            });
        } else {
            res.status(404).json({ message: 'Post not found.' });
        }
    });
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});