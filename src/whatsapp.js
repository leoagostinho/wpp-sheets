// Placeholder for WhatsApp integration

const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

function sanitizePhoneNumber(number) {
    const digits = number.replace(/\D/g, '');
  
    if (digits.length >= 10) {
      return '55' + digits;
    } else {
      throw new Error(`Invalid phone number: ${number}`);
    }
}

async function sendMessage(to, message) {
    if (!API_URL || !API_KEY) {
        throw new Error('API_URL and API_KEY must be set in .env file');
    }

    const sanitizedNumber = sanitizePhoneNumber(to);

    const payload = {
        number: sanitizedNumber,
        options: {
            delay: 1200,
            presence: 'composing',
            linkPreview: false,
        },
        textMessage: {
            text: message,
        },
    };

    try {
        await axios.post(API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY,
            },
        });
    } catch (error) {
        const errorMessage = error.response
            ? JSON.stringify(error.response.data)
            : error.message;
        throw new Error(`Failed to send to ${sanitizedNumber}: ${errorMessage}`);
    }
}

module.exports = {
    sendMessage
}; 