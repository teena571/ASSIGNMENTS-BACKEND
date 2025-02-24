const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer'); // Multer for file uploads
const path = require('path');
const app = express();

// Set up Multer storage
const storage = multer.diskStorage({
    destination: 'public/images/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});
const upload = multer({ storage });

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
    next();
});

// Load posts from JSON file
const loadPosts = () => {
    try {
        return JSON.parse(fs.readFileSync('posts.json', 'utf8'));
    } catch (error) {
        return [];
    }
};

// Save posts to JSON file
const savePosts = (posts) => {
    fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
};

// Home Page - Show all posts
app.get('/posts', (req, res) => {
    const posts = loadPosts();
    res.render('home', { posts });
});

// Single Post Page
app.get('/post', (req, res) => {
    const posts = loadPosts();
    const post = posts.find(p => p.id === parseInt(req.query.id));
    if (post) {
        res.render('post', { post });
    } else {
        res.status(404).send('Post not found');
    }
});

// Add Post Page
app.get('/add-post', (req, res) => {
    res.render('addPost');
});

// Handle New Post Submission (With Image Upload)
app.post('/add-post', upload.single('image'), (req, res) => {
    const posts = loadPosts();
    const newPost = {
        id: posts.length + 1,
        title: req.body.title,
        content: req.body.content,
        image: req.file ? `/images/${req.file.filename}` : '/images/default-thumbnail.png'
    };
    posts.push(newPost);
    savePosts(posts);
    res.redirect('/posts');
});

// Start Server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
app.get('/', (req, res) => {
    res.redirect('/posts'); // Redirects to the posts page
});

