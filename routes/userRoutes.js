const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getDb } = require('../db');

// GET /load - Load data from JSON Placeholder
router.get('/load', async (req, res) => {
    try {
        const db = getDb();
        const usersCollection = db.collection('users');
        const postsCollection = db.collection('posts');
        const commentsCollection = db.collection('comments');

        // Fetch data from JSON Placeholder
        const [usersRes, postsRes, commentsRes] = await Promise.all([
            axios.get('https://jsonplaceholder.typicode.com/users'),
            axios.get('https://jsonplaceholder.typicode.com/posts'),
            axios.get('https://jsonplaceholder.typicode.com/comments')
        ]);

        // Insert data into MongoDB
        await usersCollection.insertMany(usersRes.data);
        await postsCollection.insertMany(postsRes.data);
        await commentsCollection.insertMany(commentsRes.data);

        res.status(200).send();
    } catch (err) {
        console.error('Error loading data:', err);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

// DELETE /users - Delete all users
router.delete('/', async (req, res) => {
    try {
        const db = getDb();
        const usersCollection = db.collection('users');
        await usersCollection.deleteMany({});
        res.status(200).json({ message: 'All users deleted' });
    } catch (err) {
        console.error('Error deleting users:', err);
        res.status(500).json({ error: 'Failed to delete users' });
    }
});

// DELETE /users/:userId - Delete specific user
router.delete('/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const db = getDb();
        const usersCollection = db.collection('users');
        
        const result = await usersCollection.deleteOne({ id: userId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// GET /users/:userId - Get specific user with posts and comments
router.get('/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const db = getDb();
        const usersCollection = db.collection('users');
        const postsCollection = db.collection('posts');
        const commentsCollection = db.collection('comments');

        const user = await usersCollection.findOne({ id: userId });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const posts = await postsCollection.find({ userId }).toArray();
        
        // Get comments for each post
        for (const post of posts) {
            post.comments = await commentsCollection.find({ postId: post.id }).toArray();
        }

        res.status(200).json({
            ...user,
            posts
        });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// PUT /users - Add new user
router.put('/', async (req, res) => {
    try {
        const userData = req.body;
        const db = getDb();
        const usersCollection = db.collection('users');

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ id: userData.id });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        await usersCollection.insertOne(userData);
        res.status(201).json(userData);
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ error: 'Failed to add user' });
    }
});

module.exports = router;