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
    const response = await fetch(faucetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: publicKey,
      }),
    });
    if (!response.ok) {
      const result = await response.text();
      console.log("error response", result);
      return {
        success: false,
        status: response.status,
        error: response.statusText,
        result,
      };
    }
    const result = await response.text();
    console.log("Faucet result", result);
    return { success: true, result };
  } catch (error: any) {
    console.error("faucet error:", error);
    return {
      success: false,
      error: "faucet error " + (error?.message ?? ""),
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
