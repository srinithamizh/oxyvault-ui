import { apiRequest } from "@/services/apiClient/apiClient";
import { getUsers, updateUserRole } from "./usersService";
import { UserRole } from "@/types/user";

vi.mock("@/services/apiClient/apiClient", () => ({
  apiRequest: vi.fn(),
}));

describe("usersService", () => {
  it("requests one page of users and converts backend roles", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      content: [{ id: "user-1", name: "Alex Doe", username: "alex", email: "alex@example.com", role: "ADMIN" }],
      empty: false,
      first: true,
      last: true,
      number: 0,
      numberOfElements: 1,
      pageable: { pageNumber: 0, pageSize: 20 },
      size: 20,
      sort: { empty: true },
      totalElements: 1,
      totalPages: 1,
    });

    await expect(getUsers(0, 20)).resolves.toMatchObject({
      content: [{ id: "user-1", role: UserRole.Admin }],
      number: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    });
    expect(apiRequest).toHaveBeenCalledWith("/admin/users", { query: { page: "0", size: "20" } });
  });

  it("normalizes Spring page metadata and ROLE_ prefixed authorities", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      content: [{ id: "user-2", name: "Sam User", username: "sam", email: "sam@example.com", role: "ROLE_USER" }],
      pageable: { pageNumber: 1, pageSize: 20 },
      totalElements: 25,
    });

    await expect(getUsers(0, 20)).resolves.toMatchObject({
      content: [{ id: "user-2", role: UserRole.User }],
      first: false,
      last: true,
      number: 1,
      size: 20,
      totalElements: 25,
      totalPages: 2,
    });
  });

  it("patches a user's role using the backend role value", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(undefined);

    await updateUserRole("user/1", UserRole.User);

    expect(apiRequest).toHaveBeenCalledWith("/admin/users/user%2F1/role", {
      method: "PATCH",
      body: { role: "USER" },
    });
  });

  it("rejects an invalid users page response", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ content: "not a list" });

    await expect(getUsers(0, 20)).rejects.toThrow("expected a page with a content array");
  });
});
