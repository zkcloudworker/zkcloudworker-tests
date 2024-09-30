import { IPINFO_TOKEN } from "../env.json";

export async function geo(): Promise<boolean | undefined> {
  try {
    if (IPINFO_TOKEN === undefined)
      throw new Error("IPINFO_TOKEN is not defined");
    const response = await fetch(`https://ipinfo.io?token=${IPINFO_TOKEN}`);
    if (!response.ok) {
      console.error("Failed to fetch IP info", response.status);
      throw new Error("Failed to fetch IP info");
    }
    const result = await response.json();
    console.log("result:", result);
    return result?.country === "US";
  } catch (error) {
    console.error("geo error:", error);
    return undefined;
  }
}
