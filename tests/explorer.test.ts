import { describe, expect, it } from "@jest/globals";
import { EXPLORER_API_KEY } from "../env.json";

type Command =
  | "balance" // BalanceRequest
  | "balances" // null
  | "agent" // AgentRequest
  | "agents" // null
  | "jobResult" // JobResultRequest
  | "queryBilling"; // BalanceRequest

interface BalanceRequest {
  id: string;
}

interface JobResultRequest {
  id: string;
  jobId: string;
  includeLogs: boolean;
}

interface AgentRequest {
  developer: string;
  repo: string;
}

interface ExplorerRequest {
  command: Command;
  data: BalanceRequest | JobResultRequest | AgentRequest | null;
}

const id = "B62qqhL8xfHBpCUTk1Lco2Sq8HitFsDDNJraQG9qCtWwyvxcPADn4EV";
const repo = "mint-worker";
const developer = "DFST";
const jobId = "zkCWI2VeyaHuqmPjYhThUv1tqfZwtrvEshPJAmGPBgRJf30FB";

describe("Explorer", () => {
  it(`should get the balance`, async () => {
    const result = await fetchExplorerData({
      command: "balance",
      data: { id },
    });
    console.log("balance:", result);
  });
  it(`should get the balances`, async () => {
    const result = await fetchExplorerData({
      command: "balances",
      data: null,
    });
    console.log("balances:", result);
  });
  it(`should get the agent`, async () => {
    const result = await fetchExplorerData({
      command: "agent",
      data: { developer, repo },
    });
    console.log("agent:", result);
  });
  it(`should get the agents`, async () => {
    const result = await fetchExplorerData({
      command: "agents",
      data: null,
    });
    console.log("agents:", result);
  });
  it(`should get the job result`, async () => {
    const result = await fetchExplorerData({
      command: "jobResult",
      data: { id, jobId, includeLogs: true },
    });
    console.log("job result:", result);
  });
  it.skipn(`should get the query billing`, async () => {
    const result = await fetchExplorerData({
      command: "queryBilling",
      data: { id },
    });
    console.log("query billing:", result);
  });
});

async function fetchExplorerData(request: ExplorerRequest) {
  const response = await fetch(
    "https://cuq99yahhi.execute-api.eu-west-1.amazonaws.com/dev/explorer",
    {
      method: "POST",
      body: JSON.stringify({ ...request, auth: EXPLORER_API_KEY }),
    }
  );
  if (!response.ok) {
    console.error(
      "Failed to fetch explorer data",
      response.statusText,
      request
    );
    return null;
  }
  return response.json();
}
