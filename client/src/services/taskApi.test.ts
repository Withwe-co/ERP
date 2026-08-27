import { beforeEach, describe, expect, it, vi } from "vitest";


const {mockGet, mockPost, mockPut,} = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {response: {use: vi.fn(),},},
    })),
  },
}));

import { taskApi } from "./api";

describe("taskApi", () => {
  beforeEach(() => {mockGet.mockReset(); mockPost.mockReset(); mockPut.mockReset();});

  it("project_id를 query parameter로 전달해 태스크 목록을 조회한다", async () => {
    const responseData = [
      {
        id: 1,
        project_id: 1,
        wbs_code: "1.1",
        task_name: "테스트 태스크",
      },
    ];

    mockGet.mockResolvedValue({
      data: responseData,
    });

    const result = await taskApi.getTasks(1);

    expect(mockGet).toHaveBeenCalledWith(
      "/tasks/",
      {
        params: {
          project_id: 1,
        },
      },
    );

    expect(result).toEqual(responseData);
  });

  it("검색 및 필터 조건을 query parameter로 전달한다", async () => {
    const responseData = [
      {
        id: 1,
        project_id: 2,
        wbs_code: "1.1",
        task_name: "태스크 목록 구현",
      },
    ];

    mockGet.mockResolvedValue({
      data: responseData,
    });

    const result = await taskApi.getTasks(2, {
      search: "목록",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assignee_name: "담당자1",
      department: "담당부서1",
    });

    expect(mockGet).toHaveBeenCalledWith(
      "/tasks/",
      {
        params: {
          project_id: 2,
          search: "목록",
          status: "IN_PROGRESS",
          priority: "HIGH",
          assignee_name: "담당자1",
          department: "담당부서1",
        },
      },
    );

    expect(result).toEqual(responseData);
  });

  it("태스크 등록 시 status_code, message, data를 반환한다", async () => {
    const requestData = {
      project_id: 1,
      wbs_code: "1.1",
      task_name: "태스크 등록 테스트",
      assignee_name: "홍길동",
      department: "개발팀",
      priority: "NORMAL" as const,
      status: "TODO" as const,
      planned_start_date: "2026-08-24",
      planned_end_date: "2026-08-25",
      description: "",
      note: "",
    };

    const responseData = {
      status_code: 201,
      message: "태스크가 성공적으로 등록되었습니다.",
      data: {
        id: 1,
        ...requestData,
        is_archived: false,
        archived_at: null,
        created_at: "2026-08-24T16:00:00",
        updated_at: "2026-08-24T16:00:00",
      },
    };

    mockPost.mockResolvedValue({data: responseData,});

    const result = await taskApi.createTask(requestData);

    expect(mockPost).toHaveBeenCalledWith("/tasks/",requestData,);

    expect(result.status_code).toBe(201);
    expect(result.message).toBe("태스크가 성공적으로 등록되었습니다.",);
    expect(result.data.task_name).toBe("태스크 등록 테스트",);
  });

  it("태스크 ID와 수정 데이터를 전달해 태스크를 수정한다", async () => {
    const requestData = {
      task_name: "수정된 태스크",
      status: "IN_PROGRESS" as const,
    };

    const responseData = {
      id: 1,
      project_id: 1,
      wbs_code: "1.1",
      task_name: "수정된 태스크",
      assignee_name: "홍길동",
      department: "개발팀",
      priority: "NORMAL" as const,
      status: "IN_PROGRESS" as const,
      planned_start_date: "2026-08-24",
      planned_end_date: "2026-08-25",
      description: "",
      note: "",
      is_archived: false,
      archived_at: null,
      created_at: "2026-08-24T16:00:00",
      updated_at: "2026-08-25T09:00:00",
    };

    mockPut.mockResolvedValue({
      data: responseData,
    });

    const result = await taskApi.updateTask(
      1,
      requestData,
    );

    expect(mockPut).toHaveBeenCalledWith(
      "/tasks/1",
      requestData,
    );

    expect(result.task_name).toBe("수정된 태스크");
    expect(result.status).toBe("IN_PROGRESS");
  });

});