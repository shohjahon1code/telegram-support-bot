
import { Keyboard } from "grammy";

const home = async (ctx: any) => {
  ctx.session.routes = [];
  
  const keyboard = new Keyboard().resized();

  keyboard
    .text("Taklif")
    .row()
    .text("Shikoyat")
    .row()
    .text("Anonim murojaat")
    .row();

  await ctx.reply("Menu tanlang:", {
    reply_markup: keyboard,
  });

};

export default home;
