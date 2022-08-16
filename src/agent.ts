import { Finding, HandleTransaction, TransactionEvent, FindingSeverity, FindingType } from "forta-agent";

import { NETHERMIND_BOT_DEPLOYER, BOTS_PROXY, FUNCTION_SIGNATURE } from "./utils";

export function provideHandleTransaction(deployer: string, proxy: string, signature: string): HandleTransaction {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    if (txEvent.from != deployer.toLowerCase() || txEvent.to != proxy.toLowerCase()) {
      return findings;
    }

    const createdAgentCalls = txEvent.filterFunction(signature, proxy);

    createdAgentCalls.forEach((call) => {
      const { agentId, metadata, chainIds } = call.args;

      findings.push(
        Finding.fromObject({
          name: "Deployed Bot",
          description: "New Bot Deployed",
          alertId: "NETHERMIND-FORTA-BOT",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: "nethermind-forta-deployer",
          metadata: {
            agentId: agentId.toString(),
            metadata,
            chainIds: chainIds.toString(),
          },
        })
      );
    });

    return findings;
  };
}

export default {
  handleTransaction: provideHandleTransaction(NETHERMIND_BOT_DEPLOYER, BOTS_PROXY, FUNCTION_SIGNATURE),
};
