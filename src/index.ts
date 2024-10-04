import { Context } from "./interfaces";
import cache from "./cache";

import * as middleware from "./middleware";
import * as commands from "./commands";
import * as permissions from "./permissions";
import * as inline from "./inline";
import * as text from "./text";
import * as files from "./files";
import * as error from "./error";

import * as webserver from "./addons/web";
import * as signal from "./addons/signal";
import TelegramAddon from "./addons/telegram";

import * as mongoose from "mongoose";
import { User } from "./models/user.schema";
import home from "./responses/home";

let defaultBot: TelegramAddon;

// MongoDB connection function
async function connectToDatabase() {
  try {
    await mongoose.connect(
      "mongodb://root:tW5JJKhvFZxFsFs1lUa7ZJ50PmRB7WkvyczU11UZCYYQEPg12kGkiUCkfN9tPndl@77.90.12.185:27017/?directConnection=true"
    );

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Function to check if user has joined required channels
async function checkUserJoinedChannels(ctx: any): Promise<boolean> {
  const requiredChannels = ["-1002444328678", "-1002394414118"];
  let isMember = true;

  for (const channel of requiredChannels) {
    try {
      const member = await ctx.api.getChatMember(channel, ctx.from.id);
      if (
        member.status !== "member" &&
        member.status !== "administrator" &&
        member.status !== "creator"
      ) {
        isMember = false;
        break;
      }
    } catch (error) {
      console.error(`Error checking membership for channel ${channel}:`, error);
      isMember = false;
      break; 
    }
  }

  if (!isMember) {
    await ctx.reply("Quyidagi kanallarga azo bo'lishingiz kerak:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Azo bo'lish", url: "https://t.me/+jwRS0rBpUaRiMTMy" },
            { text: "Azo bo'lish", url: "https://t.me/+jYwoqDXACFk5NTk6" },
          ],
          [{ text: "Tekshirish", callback_data: "check_membership" }],
        ],
      },
    });
  }

  return isMember;
}

/**
 * Create Bot
 * @return {TelegramAddon}
 */
function createBot() {
  if (cache.config != null && cache.config.bot_token != null) {
    if (cache.config.bot_token === "YOUR_BOT_TOKEN") {
      console.error("Please change your bot token in config/config.yaml");
      process.exit(1);
    }
    defaultBot = new TelegramAddon(cache.config.bot_token);
  }

  // Connect to MongoDB
  connectToDatabase();

  cache.config.autoreply_confirmation =
    cache.config.autoreply_confirmation === undefined
      ? true
      : cache.config.autoreply_confirmation;
  cache.config.language.confirmationMessage =
    cache.config.language.confirmationMessage ||
    cache.config.language.contactMessage;
  cache.config.clean_replies =
    cache.config.clean_replies === undefined
      ? false
      : cache.config.clean_replies;
  cache.config.pass_start =
    cache.config.pass_start === undefined ? false : cache.config.pass_start;

  return defaultBot;
}

/**
 * Main function
 * @param {TelegramAddon} bot
 * @param {boolean} logs
 */
function main(bot: TelegramAddon = defaultBot, logs = true) {
  cache.bot = defaultBot;

  // Check addon
  if (cache.config.signal_enabled) {
    signal.init(function (ctx: Context, msg: any[]) {
      console.log(msg);
      text.handleText(bot, ctx, msg);
    });
  }

  // Start webserver
  if (cache.config.web_server) {
    webserver.init(bot);
  }

  // Init error handling
  error.init(logs);

  // Use session and check for permissions on message
  bot.use(bot.initSession());

  bot.use((ctx: Context, next: () => Promise<any>) => {
    // Check dev mode
    if (cache.config.dev_mode) {
      middleware.reply(
        ctx,
        "_Dev mode is on: You might notice some delay in messages, no replies, or other errors._",
        { parse_mode: cache.config.parse_mode }
      );
    }
    permissions.checkPermissions(ctx, next, cache.config);
  });

  // Init category keys
  const keys = inline.initInline(bot);

  // Start command with channel check
  bot.command("start", async (ctx: Context) => {
    const isJoined = await checkUserJoinedChannels(ctx);
    if (!isJoined) {
      return await ctx.reply('Menu:', {
        reply_markup: { remove_keyboard: true },
      });
    }

    if (ctx.chat.type === "private") {
      middleware.reply(ctx, cache.config.language.startCommandText);
      if (cache.config.categories && cache.config.categories.length > 0) {
        setTimeout(
          () =>
            middleware.reply(
              ctx,
              cache.config.language.services,
              inline.replyKeyboard(keys)
            ),
          500
        );
      }
      // After all initial replies, show the home buttons
      await home(ctx);
    } else {
      middleware.reply(ctx, cache.config.language.prvChatOnly);
    }
  });

  // Handle "Check Again" button click
  bot.on("callback_query", async (ctx: any) => {
    if (ctx.callbackQuery.data === "check_membership") {
      const isJoined = await checkUserJoinedChannels(ctx);
      if (isJoined) {
        await ctx.answerCallbackQuery(
          "Thank you! You have joined the required channels."
        );
        // Show the home buttons after joining
        await home(ctx);
      } else {
        await ctx.answerCallbackQuery(
          'Please join the required channels and click "Check Again".'
        );
      }
    }
  });

  if (logs) {
    bot.start();
  }
}

// Initialize the bot
createBot();
main();

export { createBot, main };
