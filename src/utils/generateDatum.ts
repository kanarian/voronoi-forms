import { getSeededRandom } from "@visx/mock-data";
import { IResponse } from "../pages";

const seededRandom = getSeededRandom(0.88);

export const generateDataVoronoiMap = (responses: IResponse[]) => {
  return responses.map((response, idx) => ({
    x: seededRandom(),
    y: seededRandom(),
    id: `${idx}`,
    response: response,
  }));
};
