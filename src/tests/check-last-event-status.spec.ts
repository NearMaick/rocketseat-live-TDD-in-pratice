import { set, reset } from "mockdate";

class LoadLastEventRepositorySpy implements ILoadLastEventRepository {
  groupId?: string;
  callsCount = 0;
  output?: { endDate: Date };
  async loadLastEvent({
    groupId,
  }: {
    groupId: string;
  }): Promise<{ endDate: Date } | undefined> {
    this.groupId = groupId;
    this.callsCount += 1;
    return this.output;
  }
}

interface ILoadLastEventRepository {
  loadLastEvent: (input: {
    groupId: string;
  }) => Promise<{ endDate: Date } | undefined>;
}

class CheckLastEventStatus {
  constructor(
    private readonly loadLastEventRepository: ILoadLastEventRepository
  ) {}
  async execute({ groupId }: { groupId: string }): Promise<string> {
    const event = await this.loadLastEventRepository.loadLastEvent({ groupId });
    if (event === undefined) return "done";
    const now = new Date();
    return event.endDate > now ? "active" : "InReview";
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
  const groupId = "any_group_id";

  beforeAll(() => {
    set(new Date());
  });

  afterAll(() => {
    reset();
  });

  it("should get last event data", async () => {
    const { systemUnderTest, loadLastEventRepository } = makeSUT();

    await systemUnderTest.execute({ groupId });

    expect(loadLastEventRepository.groupId).toBe("any_group_id");
    expect(loadLastEventRepository.callsCount).toBe(1);
  });

  it("should return ststus done when group has no event", async () => {
    const { systemUnderTest, loadLastEventRepository } = makeSUT();
    loadLastEventRepository.output = undefined;

    const status = await systemUnderTest.execute({ groupId });

    expect(status).toBe("done");
  });

  it("should return ststus active when now is before event end time", async () => {
    const { systemUnderTest, loadLastEventRepository } = makeSUT();
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() + 1),
    };

    const status = await systemUnderTest.execute({ groupId });

    expect(status).toBe("active");
  });

  it("should return ststus inReview when now is after event end time", async () => {
    const { systemUnderTest, loadLastEventRepository } = makeSUT();
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() - 1),
    };

    const status = await systemUnderTest.execute({ groupId });

    expect(status).toBe("InReview");
  });
});
