import { FindingType, FindingSeverity, Finding, HandleTransaction } from "forta-agent";
import { Interface } from "ethers/lib/utils";

import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { provideHandleTransaction } from "./agent";
import { BOTS_PROXY, FUNCTION_ABI, NETHERMIND_BOT_DEPLOYER } from "./utils";

describe("Bots deployment", () => {
  let proxy = new Interface([FUNCTION_ABI]);
  let handleTransaction: HandleTransaction;

  type mockMetadata = {
    agentId: string,
    metadata: string,
    chainIds: string,
  }

  let mockFinding = (metadata: mockMetadata): Finding => {
    return Finding.fromObject({
      name: "Deployed Bot",
      description: "New Bot Deployed",
      alertId: "NETHERMIND-FORTA-BOT",
      severity: FindingSeverity.Info,
      type: FindingType.Info,
      protocol: "nethermind-forta-deployer",
      metadata: {
        agentId: metadata.agentId,
        metadata: metadata.metadata,
        chainIds: metadata.chainIds,
      },
    })
  }

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(NETHERMIND_BOT_DEPLOYER, BOTS_PROXY, FUNCTION_ABI);
  });

  it("returns empty findings if FROM is not equal deployer", async () => {
    let findings: Finding[];
    let txEvent: TestTransactionEvent;
    txEvent = new TestTransactionEvent()
      .setTo(BOTS_PROXY)
      .setFrom("0x2477d97E71F7738d48e86aF5a107616F71F43263")
      .addTraces({
        to: BOTS_PROXY,
        function: proxy.getFunction("createAgent"),
        arguments: [
          123456,
          "0x2477d97E71F7738d48e86aF5a107616F71F43263",
          "QmXGC4eWXjShzXs9T3nUvrYTTPqLQCEfArHfuSLSCagE2E",
          [56],
        ],
      });

    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty when no bot is deployed", async () => {
    let txEvent: TestTransactionEvent;
    let findings: Finding[];
    txEvent = new TestTransactionEvent();
    findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("return and detect multiple calls to createAgent", async () => {
    let findings: Finding[];
    let txEvent: TestTransactionEvent;
    txEvent = new TestTransactionEvent()
      .setTo(BOTS_PROXY)
      .setFrom(NETHERMIND_BOT_DEPLOYER)
      .addTraces({
        to: BOTS_PROXY,
        from: NETHERMIND_BOT_DEPLOYER,
        function: proxy.getFunction("createAgent"),
        arguments: [
          123456,
          "0x2477d97E71F7738d48e86aF5a107616F71F43263",
          "QmXGC4eWXjShzXs9T3nUvrYTTPqLQCEfArHfuSLSCagE2E",
          [56],
        ],
      })
      .addTraces({
        to: BOTS_PROXY,
        from: NETHERMIND_BOT_DEPLOYER,
        function: proxy.getFunction("createAgent"),
        arguments: [
          12345678,
          "0x2477d97E71F7738d48e86aF5a107616F71F43263",
          "QmXGC4eWXjShzXs9T3nUvrYTTPqLQCEfArHfuSLSCagE2E",
          [56],
        ],
      })

    findings = await handleTransaction(txEvent);

    let metadata1: mockMetadata = {
      agentId: "123456",
      metadata: "QmXGC4eWXjShzXs9T3nUvrYTTPqLQCEfArHfuSLSCagE2E",
      chainIds: "56"
    }

    let metadata2: mockMetadata = {
      agentId: "12345678",
      metadata: "QmXGC4eWXjShzXs9T3nUvrYTTPqLQCEfArHfuSLSCagE2E",
      chainIds: "56"
    }
    expect(findings).toStrictEqual([mockFinding(metadata1), mockFinding(metadata2)]);
  })

  it("returns the finding when bot is created", async () => {
    let findings: Finding[];
    let txEvent: TestTransactionEvent;
    txEvent = new TestTransactionEvent()
      .setTo(BOTS_PROXY)
      .setFrom(NETHERMIND_BOT_DEPLOYER)
      .addTraces({
        to: BOTS_PROXY,
        function: proxy.getFunction("createAgent"),
        arguments: [
          123456,
          "0x2477d97E71F7738d48e86aF5a107616F71F43263",
          "QmXGC4eWXjShzXs9T3nUvrYTTPqLQCEfArHfuSLSCagE2E",
          [56],
        ],
      });

    findings = await handleTransaction(txEvent);

    let metadata: mockMetadata = {
      agentId: "123456",
      metadata: "QmXGC4eWXjShzXs9T3nUvrYTTPqLQCEfArHfuSLSCagE2E",
      chainIds: "56"
    }
    expect(findings).toStrictEqual([mockFinding(metadata)]);
  });
});
