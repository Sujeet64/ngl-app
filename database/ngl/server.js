const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const NodeCache = require("node-cache");
const app = express();
const cors = require('cors');

const allowedOrigins = ['https://ngl-ask.netlify.app', 'https://sujeet64.github.io'];

// Set up CORS with allowed origins
app.use(cors({
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// Database connection URI
const mongoURI = 'mongodb+srv://sujeetsenthilkumar:Mongodbpass******6@experimentdb.a0csq.mongodb.net/?retryWrites=true&w=majority&appName=experimentdb';

// Set up MongoDB connection with connection pooling
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // Set connection pool size
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Connection error', error);
});

// Define schema and model
const messageSchema = new mongoose.Schema({
    userName: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cache setup with a TTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60 });

// Endpoint to send messages
app.post('/send-message', async (req, res) => {
    try {
        const { userName, message } = req.body;
        if (!userName || !message) {
            return res.status(400).send('Name and message are required');
        }

        const newMessage = new Message({ userName, message });
        await newMessage.save();

        // Clear the cache as new data has been added
        cache.del("messages");

        res.status(201).send('Message saved successfully');
    } catch (error) {
        console.error('Error saving message:', error); 
        res.status(500).send('Error saving message');
    }
});

// Endpoint to get messages with caching
app.get('/messages', async (req, res) => {
    const cachedMessages = cache.get("messages");
    if (cachedMessages) {
        return res.json(cachedMessages);
    }

    try {
        const messages = await Message.find().sort({ timestamp: -1 }).limit(100); // Fetch latest 100 messages
        cache.set("messages", messages); // Cache the fetched messages
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ status: 'error', message: 'Error fetching messages' });
    }
});

// Basic root route
app.get('/', (req, res) => {
    res.send('Server is running. Use POST /send-message to send messages.');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
