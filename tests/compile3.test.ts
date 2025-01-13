import { describe, expect, it } from "@jest/globals";

import {
  DeployArgs,
  PublicKey,
  SmartContract,
  Bool,
  method,
  AccountUpdate,
  UInt64,
  Struct,
  Permissions,
  VerificationKey,
} from "o1js";
import { initBlockchain } from "zkcloudworker";
const CLAIM_AMOUNT = 2200e9;

export interface VaultDeployProps extends Exclude<DeployArgs, undefined> {
  admin: PublicKey;
}

export class ClaimEvent extends Struct({
  recipient: PublicKey,
  amount: UInt64,
}) {}

export class VaultContract extends SmartContract {
  readonly events = {
    Claim: ClaimEvent,
  };

  async deploy(props: VaultDeployProps) {
    await super.deploy(props);

    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });
  }

  /** Update the verification key.
   * Note that because we have set the permissions for setting the verification key to `impossibleDuringCurrentVersion()`, this will only be possible in case of a protocol update that requires an update.
   */
  @method
  public async updateVerificationKey(vk: VerificationKey) {
    this.account.verificationKey.set(vk);
  }

  /**
   * Claims tokens for a new user account.
   * @param user - The public key of the user claiming tokens
   * @returns An AccountUpdate representing the receiver's account changes
   * @throws If the receiver account already exists
   */
  @method.returns(AccountUpdate)
  public async claim(user: PublicKey): Promise<AccountUpdate> {
    const claimAmount = UInt64.from(CLAIM_AMOUNT);
    this.balance.subInPlace(claimAmount);

    const receiverAU = AccountUpdate.default(user, this.tokenId);
    // Require that the receiver account is new to prevent double claiming
    receiverAU.account.isNew.requireEquals(Bool(true));
    receiverAU.balance.addInPlace(claimAmount);

    this.emitEvent(
      "Claim",
      new ClaimEvent({ recipient: user, amount: claimAmount })
    );
    return receiverAU;
  }
}

describe("Compile scam contract to check vk on mainnet", () => {
  it(`should compile`, async () => {
    await initBlockchain("mainnet");

    const vk = (await VaultContract.compile()).verificationKey;
    console.log("vk", vk.hash.toJSON());
  });
});
