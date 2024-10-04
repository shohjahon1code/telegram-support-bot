import { Keyboard } from "grammy";

const request_contact = async (conversation: any, ctx: any) => {
  let data = null;

  do {
    await ctx.reply(ctx.t("request_contact"), {
      reply_markup: Keyboard.from([
        [Keyboard.requestContact(ctx.t("send_contact"))],
      ]).resized(),
    });

    const new_ctx = await conversation.wait();

    if (new_ctx.message?.contact) {
      data = new_ctx.message.contact.phone_number;
    } else if (new_ctx.message?.text) {
      if (
        new_ctx.message.text.match(
          /\+?998\s*(\d{2})\s*?\d{3}\s*?\d{2}\s*?\d{2}/gm
        )
      ) {
        data = new_ctx.message.text;
      }
    }
  } while (!data);

  return { data };
};

export default request_contact;
