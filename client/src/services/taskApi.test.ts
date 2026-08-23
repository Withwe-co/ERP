import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    })),
  },
}));

import { taskApi } from "./api";

describe("taskApi", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("project_id를 query parameter로 전달해 태스크 목록을 조회한다", async () => {
    const responseData = [
      {
        id: 1,
        project_id: 1,
        wbs_id: 1,
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
        wbs_id: 1,
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

});