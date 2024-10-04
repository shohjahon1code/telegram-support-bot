import { InlineKeyboard } from "grammy";

import axios, { AxiosResponse } from "axios";

interface District {
  _id: string;
  name: string;
  code: number;
}

async function getDistricts(regionCode: number): Promise<District[]> {
  try {
    const response: AxiosResponse<District[]> = await axios.get(
      `/api/areas/regions/${regionCode}/districts`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching districts:", error);
    return [];
  }
}

const request_district = async (
  conversation: any,
  ctx: any,
  regionCode: number,
  message: string
) => {
  const districts = await getDistricts(regionCode);

  if (districts.length === 0) {
    await ctx.reply(
      "Tumanlar topilmadi. Iltimos, keyinroq qayta urinib ko'ring."
    );
    return { data: {} };
  }

  const districtKeyboard = new InlineKeyboard();
  districts.forEach((district: District) => {
    districtKeyboard.text(district.name, `${district.code}`).row();
  });

  await ctx.reply(message, {
    reply_markup: districtKeyboard,
  });

  const districtResponse = await conversation.waitForCallbackQuery(/^.*$/);

  const selectedDistrictCode: string = districtResponse.callbackQuery?.data;

  const selectedDistrictName =
    districts.find(
      (district: District) => district.code === Number(selectedDistrictCode)
    )?.name ?? "Unknown district";

  return {
    data: { name: selectedDistrictName, code: Number(selectedDistrictCode) },
  };
};

export default request_district;
