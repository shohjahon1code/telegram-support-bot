import { Keyboard } from "grammy";

const request_text = async (conversation: any, ctx: any, message: string) => {
  let data = null;

  do {
    await ctx.reply(message, {
      reply_markup: { remove_keyboard: true },
    });

    const {
      message: { text },
    } = await conversation.waitFor("message:text");

    if (!text.startsWith("/")) {
      data = text;
    }
  } while (!data);

  return { data };
};

export default request_text;
