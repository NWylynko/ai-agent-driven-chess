

import { log, step } from "@restackio/ai/workflow";

export async function greetingWorkflow(name: String) {
  const evalboardstate1 = await step().boardstate1("");
  log.info(welcomeMessage);

  const goodbyeMessage = await step().goodbye("human");
  log.info(goodbyeMessage);
}
