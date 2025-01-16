const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const allowedOrigins = ['https://ngl-ask.netlify.app', 'https://ftnithish.github.io/ngl-final/'];

app.use(cors({
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));



// Use the connection string from the .env file
const mongoURI = 'mongodb://localhost:27017/ngl';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Connection error', error);
});

const messageSchema = new mongoose.Schema({
    userName: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.post('/send-message', async (req, res) => {
    try {
        const { userName, message } = req.body;
        if (!userName || !message) {
            return res.status(400).send('Name and message are required');
        }
        const newMessage = new Message({ userName, message });
        await newMessage.save();
        res.status(201).send('Message saved successfully');
    } catch (error) {
        console.error('Error saving message:', error); 
        res.status(500).send('Error saving message');
    }
});

app.get('/', (req, res) => {
    console.log(`Ping received at ${new Date().toLocaleString()}`);
    res.send('Server is running. Use POST /send-message to send messages.');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
