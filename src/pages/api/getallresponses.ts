import type { NextApiRequest, NextApiResponse } from "next";
import { google, drive_v3 } from "googleapis";

const formId = "1ALKiTp5aQYJW21g9ipV86K-hshwmcQTWnHI-u10bT7I";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await google.auth.getClient({
    scopes: ["https://www.googleapis.com/auth/forms.responses.readonly"],
  });

  const forms = google.forms({
    version: "v1",
    auth: auth,
  });
  // const thisForm = await forms.forms.get({
  //   formId: formId,
  // });
  // console.log(thisForm.data);

  const responses = await forms.forms.responses
    .list({
      formId: formId,
    })
    .then((response) => response.data);

  const response = await responses.responses?.map((response) => {
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
