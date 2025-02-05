const adminIds = process.env.ADMIN_CHAT_ID.split(",");

function isAdmin(chatId) {
  if (!chatId) {
    console.error("isAdmin: chatId is undefined");
    return false;
  }
  return adminIds.includes(chatId.toString());
}

module.exports = { isAdmin };
