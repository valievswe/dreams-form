/**
 * Handles incoming messages and returns appropriate responses.
 * @param {string} message - The incoming message from the user.
 * @param {Object} ctx - The Telegram context object.
 * @param {boolean} isAdmin - Whether the user is an admin.
 * @param {Object} keyboard - The keyboard to display to the user.
 * @param {Map} users - The map of users.
 */
const { Markup } = require("telegraf");

function handleMessage(message, ctx, isAdmin, keyboard, users) {
  const userId = ctx.from.id;

  // Update user info
  const userInfo = {
    username: ctx.from.username || "N/A",
    firstName: ctx.from.first_name || "N/A",
    lastName: ctx.from.last_name || "N/A",
    timestamp: new Date().toISOString(),
  };
  users.set(userId, userInfo);

  // Handle specific keyboard inputs
  switch (message) {
    case "Maktab uchun qabul":
      ctx.reply("Maktab uchun qabul bo'limiga xush kelibsiz", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Maktab uchun qabul",
                web_app: {
                  url: "https://8028-213-230-74-176.ngrok-free.app/maktab",
                },
              },
            ],
            [
              {
                text: "Prezident maktabi uchun qabul",
                web_app: {
                  url: "https://8028-213-230-74-176.ngrok-free.app/president",
                },
              },
            ],
            [
              {
                text: "Mental arifmetika",
                web_app: {
                  url: "https://8028-213-230-74-176.ngrok-free.app/mental",
                },
              },
            ],
            [
              {
                text: "DTM test imtihonlari",
                web_app: {
                  url: "https://8028-213-230-74-176.ngrok-free.app/imtihon",
                },
              },
            ],
          ],
        },
      });
      break;

    case "Ma'lumotlarni olish":
      if (isAdmin) {
        let userDataText = "Registered Users:\n";
        if (users.size === 0) {
          userDataText = "No users have interacted with the bot yet.";
        } else {
          users.forEach((info, id) => {
            userDataText += `\nID: ${id}\nUsername: @${info.username}\nName: ${info.firstName} ${info.lastName}\nLast Active: ${info.timestamp}\n`;
          });
        }
        ctx.reply(userDataText, { reply_markup: keyboard });
      } else {
        ctx.reply("This command is for admins only.", {
          reply_markup: keyboard,
        });
      }
      break;
    default:
      const response = handleSimpleMessage(message);
      ctx.reply(response, { reply_markup: keyboard });
      break;
  }
}

// Export the handler functions for use in other files
module.exports = {
  handleMessage,
};
