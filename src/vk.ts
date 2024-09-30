import { SmartContract } from "o1js";

export async function verifySmartContract(contract: typeof SmartContract) {
  if (Object.prototype.isPrototypeOf.call(SmartContract, contract)) {
    const methods = await contract.analyzeMethods();
    const name = contract.name;
    const vk = (await contract.compile()).verificationKey;
    console.log("SmartContract is verified");
    return {
      name,
      verificationKey: { verificationKey: vk.data, hash: vk.hash.toJSON() },
      methods,
    };
  } else {
    console.log("SmartContract is not verified");
    return undefined;
  }
}
