import join_channel_response from "../responses/join-chanel.response";

import { channel_status } from "../utils/channel.status";

export const channel_handler = async (ctx: any) => {
  if (!ctx.from) return;

  const has_joined = await channel_status(ctx);

  if (!has_joined) {
    return await join_channel_response(ctx);
  }
};
