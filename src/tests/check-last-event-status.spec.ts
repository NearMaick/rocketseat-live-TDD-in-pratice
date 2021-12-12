class LoadLastEventRepositoryMock implements ILoadLastEventRepository {
  groupId?: string;
  async loadLastEvent(groupId: string): Promise<void> {
    this.groupId = groupId;
  }
}

interface ILoadLastEventRepository {
  loadLastEvent: (groupId: string) => Promise<void>;
}

class CheckLastEventStatus {
  constructor(
    private readonly loadLastEventRepository: ILoadLastEventRepository
  ) {}
  async execute(groupId: string) {
    await this.loadLastEventRepository.loadLastEvent(groupId);
  }
}

describe("CheckLastEventStatus", () => {
  it("should get last event data", async () => {
    const loadLastEventRepositoryMock = new LoadLastEventRepositoryMock();
    const checkLastEventStatus = new CheckLastEventStatus(
      loadLastEventRepositoryMock
    );

    await checkLastEventStatus.execute("any_group_id");

    expect(loadLastEventRepositoryMock.groupId).toBe("any_group_id");
  });
});
