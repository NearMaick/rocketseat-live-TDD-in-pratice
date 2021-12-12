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

describe("CheckLastEventStatus", () => {
  it("should get last event data", async () => {
    const loadLastEventRepositoryMock = new LoadLastEventRepositorySpy();
    const systemUnderTest = new CheckLastEventStatus(
      loadLastEventRepositoryMock
    );

    await systemUnderTest.execute("any_group_id");

    expect(loadLastEventRepositoryMock.groupId).toBe("any_group_id");
    expect(loadLastEventRepositoryMock.callsCount).toBe(1);
  });

  it("should return ststus done when group has no event", async () => {
    const loadLastEventRepositoryMock = new LoadLastEventRepositorySpy();
    loadLastEventRepositoryMock.output = undefined;
    const systemUnderTest = new CheckLastEventStatus(
      loadLastEventRepositoryMock
    );

    const status = await systemUnderTest.execute("any_group_id");

    expect(status).toBe("done");
  });
});
