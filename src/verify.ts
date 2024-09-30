import {
  blockchain,
  initBlockchain,
  getAccountFromGraphQL,
} from "zkcloudworker";
import { initializeBindings, SmartContract, ZkProgram } from "o1js";
import packageJson from "../package.json";

export interface VerificationData {
  contract: typeof SmartContract;
  programs: any[]; // ZkProgram[];
  address: string;
  chain: blockchain;
}

export interface VerificationAnswer {
  name: string;
  verificationKey: { verificationKey: string; hash: string };
  methods: Record<
    string,
    {
      actions: number;
      rows: number;
      digest: string;
      gates: any[];
    }
  >;
}

export async function verify(
  data: VerificationData
): Promise<VerificationAnswer | undefined> {
  const { contract, address, chain } = data;
  console.log(
    `starting verifier version ${
      packageJson.version ?? "unknown"
    } on chain ${chain}`
  );
  await initializeBindings();
  const net = await initBlockchain(chain);
  const account = await getAccountFromGraphQL({
    publicKey: address,
    mina: net.network.mina,
  });
  if (account?.verificationKey === undefined) {
    console.error("Account does not have a verification key");
    return undefined;
  }

  for (const program of data.programs) {
    if (program.compile === undefined) {
      console.error("Program does not have a compile method");
      return undefined;
    }
    await program.compile();
  }
  const verificationAnswer = await verifySmartContract(contract);
  if (verificationAnswer === undefined) {
    console.error("SmartContract is not verified");
    return undefined;
  }
  if (
    verificationAnswer.verificationKey.verificationKey !==
    account.verificationKey.verificationKey
  ) {
    console.error("Verification key does not match account verification key");
    return undefined;
  }
  if (
    verificationAnswer.verificationKey.hash !== account.verificationKey.hash
  ) {
    console.error(
      "Verification key hash does not match account verification key hash"
    );
    return undefined;
  }
  console.log("SmartContract is verified");
  return verificationAnswer;
}

async function verifySmartContract(
  contract: typeof SmartContract
): Promise<VerificationAnswer | undefined> {
  if (Object.prototype.isPrototypeOf.call(SmartContract, contract)) {
    const methods = await contract.analyzeMethods();
    const name = contract.name;
    const vk = (await contract.compile()).verificationKey;

    return {
      name,
      verificationKey: { verificationKey: vk.data, hash: vk.hash.toJSON() },
      methods,
    } as VerificationAnswer;
  } else {
    console.error("SmartContract is not verified: wrong type");
    return undefined;
  }
}
