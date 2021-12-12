import { set, reset } from "mockdate";

type EventStatus = { status: string };

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
  async execute({ groupId }: { groupId: string }): Promise<EventStatus> {
    const event = await this.loadLastEventRepository.loadLastEvent({ groupId });
    if (event === undefined) return { status: "done" };
    const now = new Date();
    return event.endDate >= now ? { status: "active" } : { status: "InReview" };
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

  it("should return status done when group has no event", async () => {
    const { systemUnderTest, loadLastEventRepository } = makeSUT();
    loadLastEventRepository.output = undefined;

    const eventStatus = await systemUnderTest.execute({ groupId });

    expect(eventStatus.status).toBe("done");
  });

  it("should return status active when now is before event end time", async () => {
    const { systemUnderTest, loadLastEventRepository } = makeSUT();
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() + 1),
    };

    const eventStatus = await systemUnderTest.execute({ groupId });

    expect(eventStatus.status).toBe("active");
  });

  it("should return status active when now is equal to event end time", async () => {
    const { systemUnderTest, loadLastEventRepository } = makeSUT();
    loadLastEventRepository.output = {
      endDate: new Date(),
    };

    const eventStatus = await systemUnderTest.execute({ groupId });

    expect(eventStatus.status).toBe("active");
  });

  it("should return status inReview when now is after event end time", async () => {
    const { systemUnderTest, loadLastEventRepository } = makeSUT();
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() - 1),
    };

    const eventStatus = await systemUnderTest.execute({ groupId });

    expect(eventStatus.status).toBe("InReview");
  });
});
