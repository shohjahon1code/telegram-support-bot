import { InlineKeyboard } from "grammy";
import axios, { AxiosResponse } from "axios";

interface Region {
  _id: string;
  name: string;
  code: number;
}

async function getRegions(): Promise<Region[]> {
  try {
    const response: AxiosResponse<Region[]> = await axios.get(
      `/api/areas/regions`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching regions:", error);
    return [];
  }
}

const request_region = async (conversation: any, ctx: any, message: string) => {
  const regions = await getRegions();

  if (regions.length === 0) {
    await ctx.reply(
      "Hududlar topilmadi. Iltimos, keyinroq qayta urinib ko'ring."
    );
    return { data: {} };
  }

  const regionKeyboard = new InlineKeyboard();
  regions.forEach((region: Region) => {
    regionKeyboard.text(region.name, `${region.code}`).row();
  });

  await ctx.reply(message, {
    reply_markup: regionKeyboard,
  });

  const regionResponse = await conversation.waitForCallbackQuery(/^.*$/);

  const selectedRegionCode: string = regionResponse.callbackQuery?.data;

  const selectedRegionName =
    regions.find((region: Region) => region.code === Number(selectedRegionCode))
      ?.name ?? "Unknown region";

  return {
    data: { name: selectedRegionName, code: Number(selectedRegionCode) },
  };
};

export default request_region;
