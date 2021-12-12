class LoadLastEventRepositorySpy implements ILoadLastEventRepository {
  groupId?: string;
  callsCount = 0;
  output: undefined;
  async loadLastEvent(groupId: string): Promise<void> {
    this.groupId = groupId;
    this.callsCount += 1;
    return this.output;
  }
}

interface ILoadLastEventRepository {
  loadLastEvent: (groupId: string) => Promise<void>;
}

class CheckLastEventStatus {
  constructor(
    private readonly loadLastEventRepository: ILoadLastEventRepository
  ) {}
  async execute(groupId: string): Promise<string> {
    await this.loadLastEventRepository.loadLastEvent(groupId);
    return "done";
  }
}

type SUTOutput = {
  systemUnderTest: CheckLastEventStatus;
  loadLastEventRepository: LoadLastEventRepositorySpy;
};

const makeSUT = (): SUTOutput => {
  const loadLastEventRepository = new LoadLastEventRepositorySpy();
  const systemUnderTest = new CheckLastEventStatus(loadLastEventRepository);
  return { systemUnderTest, loadLastEventRepository };
};

describe("CheckLastEventStatus", () => {
  it("should get last event data", async () => {
    const { systemUnderTest, loadLastEventRepository } = makeSUT();

    await systemUnderTest.execute("any_group_id");

    expect(loadLastEventRepository.groupId).toBe("any_group_id");
    expect(loadLastEventRepository.callsCount).toBe(1);
  });

  it("should return ststus done when group has no event", async () => {
    const { systemUnderTest, loadLastEventRepository } = makeSUT();
    loadLastEventRepository.output = undefined;

    const status = await systemUnderTest.execute("any_group_id");

    expect(status).toBe("done");
  });
});
