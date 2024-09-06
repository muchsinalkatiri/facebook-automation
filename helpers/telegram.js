const axios = require("axios");
const dotenv = require('dotenv')
dotenv.config();

// Akses variabel dari .env

const send = async function (message, reply_id) {
const chatId = process.env.CHAT_ID;
const botId = process.env.BOT_ID;

  const thread_id = "660";

  const config = {
    chat_id: chatId,
    text: message,
    message_thread_id: thread_id,
  };

  if (reply_id) {
    config.reply_to_message_id = reply_id;
  }

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${botId}/sendmessage`,
      config
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error; // Optional: rethrow the error if needed
  }
};

module.exports = {
  send,
};
