import { InlineKeyboard } from "grammy";
import axios, { AxiosResponse } from "axios";

interface Neighborhood {
  _id: string;
  name: string;
  code: number;
}

async function getNeighborhoods(
  regionCode: number,
  districtCode: number
): Promise<Neighborhood[]> {
  try {
    const response: AxiosResponse<Neighborhood[]> = await axios.get(
      `/api/areas/regions/${regionCode}/districts/${districtCode}/neighborhoods`,
      {
        headers: {
          Authorization: `Bearer token`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching neighborhoods:", error);
    return [];
  }
}

const request_neighborhood = async (
  conversation: any,
  ctx: any,
  regionCode: number,
  districtCode: number,
  message: string
) => {
  const neighborhoods = await getNeighborhoods(regionCode, districtCode);

  if (neighborhoods.length === 0) {
    await ctx.reply(
      "Mahallalar topilmadi. Iltimos, keyinroq qayta urinib ko'ring."
    );
    return { data: {} };
  }

  const neighborhoodKeyboard = new InlineKeyboard();
  neighborhoods.forEach((neighborhood: Neighborhood) => {
    neighborhoodKeyboard.text(neighborhood.name, `${neighborhood.code}`).row();
  });

  await ctx.reply(message, {
    reply_markup: neighborhoodKeyboard,
  });

  const neighborhoodResponse = await conversation.waitForCallbackQuery(/^.*$/);

  const selectedNeighborhoodCode: string =
    neighborhoodResponse.callbackQuery?.data;

  const selectedNeighborhoodName =
    neighborhoods.find(
      (neighborhood: Neighborhood) =>
        neighborhood.code === Number(selectedNeighborhoodCode)
    )?.name ?? "Unknown neighborhood";

  return {
    data: {
      name: selectedNeighborhoodName,
      code: Number(selectedNeighborhoodCode),
    },
  };
};

export default request_neighborhood;
