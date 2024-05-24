import { sleep } from "zkcloudworker";

export async function faucet(params: {
  publicKey: string;
  faucetUrl: string;
  explorerUrl: string;
  network: string;
}) {
  const { publicKey, faucetUrl, network, explorerUrl } = params;
  //console.log("faucet params:", params);

  try {
    const faucetResponse = await fetch(faucetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: publicKey,
      }),
    });
    //console.log("faucet response:", faucetResponse);
    const result = await faucetResponse.text();
    //console.log("faucet result:", result);
    return {
      error: null,
      result,
    };
  } catch (error) {
    console.error("faucet error:", error);
    return {
      error: "Maximum allowed withdrawls exceeded.",
    };
  }
}

export async function faucetDevnet(params: {
  publicKey: string;
  faucetUrl: string;
  explorerUrl: string;
  network: string;
}) {
  const { publicKey, faucetUrl, network, explorerUrl } = params;
  //console.log("faucet params:", params);

  try {
    const faucetResponse = await fetch(faucetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: publicKey,
        network: "devnet",
      }),
    });
    //console.log("faucet response:", faucetResponse);
    const result = await faucetResponse.json();
    console.log("faucet result:", result);
    if (result.status === "rate-limit") await sleep(1000 * 60 * 30);
    return {
      error: null,
      result,
    };
  } catch (error) {
    console.error("faucet error:", error);
    return {
      result: error,
    };
  }
}
