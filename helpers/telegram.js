const axios = require("axios");

const send = async function (message, reply_id) {
  const chat_id = "";
  const bot_id = "";
  const thread_id = "";

  const config = {
    chat_id: chat_id,
    text: message,
    message_thread_id: thread_id,
  };

  if (reply_id) {
    config.reply_to_message_id = reply_id;
  }

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${bot_id}/sendmessage`,
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
