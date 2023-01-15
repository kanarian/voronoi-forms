import type { NextApiRequest, NextApiResponse } from "next";
import { google, drive_v3 } from "googleapis";

const formId = "1ALKiTp5aQYJW21g9ipV86K-hshwmcQTWnHI-u10bT7I";
const SCOPES = ["https://www.googleapis.com/auth/forms.responses.readonly"];
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("flag0");
  const { privateKey } = JSON.parse(
    process.env.GOOGLE_PRIVATE_KEY || "{ privateKey: null }"
  ) as { privateKey: string };
  const authInit = new google.auth.GoogleAuth({
    scopes: SCOPES,
    projectId: process.env.GOOGLE_PROJECTID,
    credentials: {
      private_key: privateKey,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
    },
  });
  console.log("flag1");
  const auth = await authInit.getClient();

  const forms = google.forms({
    version: "v1",
    auth: auth,
  });
  console.log("flag2");
  const responses = await forms.forms.responses
    .list({
      formId: formId,
    })
    .then((response) => response.data);
  console.log("flag3");
  const response = responses.responses?.map((response) => {
    const thisID = response.responseId;
    const thisAnswerIds = Object.keys(response.answers!);
    const thisAnswers = thisAnswerIds.map((thisAnswerId) => {
      const thisQuestion = response.answers![thisAnswerId];
      const thisAnswer = thisQuestion?.textAnswers?.answers![0]?.value ?? "";
      const thisQuestionId = thisQuestion?.questionId;
      return { questionId: thisQuestionId, answer: thisAnswer };
    });
    return thisAnswers;
  });

  return res.status(200).json(response);
}
