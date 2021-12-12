class CheckLastEventStatus {
  constructor(
    private readonly loadLastEventRepository: LoadLastEventRepository
  ) {}

  async execute(groupId: string) {
    this.loadLastEventRepository.groupId = groupId;
  }
}

class LoadLastEventRepository {
  groupId?: string;
}

describe("CheckLastEventStatus", () => {
  it("should get last event data", async () => {
    const loadLastEventRepository = new LoadLastEventRepository();
    const checkLastEventStatus = new CheckLastEventStatus(
      loadLastEventRepository
    );

    await checkLastEventStatus.execute("any_group_id");

    expect(loadLastEventRepository.groupId).toBe("any_group_id");
  });
});
