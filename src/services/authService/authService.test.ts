import { AuthError, checkUsernameAvailable, login, register } from "./authService";
import { fakeBackend } from "@/test/fakeBackend";
import { fullNameOf, seedUsers } from "@/test/mockUsers";

const seed = seedUsers[0];
const newAccount = {
  firstName: " Meera ",
  lastName: " Nair ",
  username: " meera ",
  email: "Meera@Example.com",
  password: "Str0ng!pass",
};

describe("authService", () => {
  beforeEach(() => fakeBackend.install());

  describe("login", () => {
    it("returns the bearer token and the user for valid credentials", async () => {
      const session = await login({ identifier: seed.email, password: seed.password });
      expect(session).toEqual({
        accessToken: "token-u-1",
        user: { id: "u-1", name: fullNameOf(seed), username: seed.username, email: seed.email, role: "admin" },
      });
      expect(fakeBackend.callsTo("/profile")[0].headers.Authorization).toBe(`Bearer token-${seed.id}`);
    });

    it("accepts the username as the identifier, ignoring case and whitespace", async () => {
      await expect(login({ identifier: ` ${seed.username.toUpperCase()} `, password: seed.password })).resolves.toMatchObject({
        user: { id: "u-1" },
      });
    });

    it("loads a token-only login response using the bearer token and normalizes the profile role", async () => {
      await expect(login({ identifier: seed.email, password: seed.password })).resolves.toEqual({
        accessToken: `token-${seed.id}`,
        user: {
          id: seed.id,
          name: fullNameOf(seed),
          username: seed.username,
          email: seed.email,
          role: seed.role,
        },
      });
    });

    it("posts to /auth/login with no credentials or token", async () => {
      await login({ identifier: seed.email, password: seed.password });
      const [request] = fakeBackend.callsTo("/auth/login");
      expect(request.method).toBe("POST");
      expect(request.body).toEqual({ identifier: seed.email, password: seed.password });
      expect(request.init.credentials).toBe("omit");
      expect(request.init.cache).toBe("no-store");
      expect(request.headers.Authorization).toBeUndefined();
    });

    it.each([400, 401, 403])("maps a %i response to invalidCredentials", async (status) => {
      fakeBackend.failNext(status);
      const attempt = login({ identifier: seed.email, password: seed.password });
      await expect(attempt).rejects.toBeInstanceOf(AuthError);
      await expect(attempt).rejects.toMatchObject({ code: "invalidCredentials" });
    });

    it("rejects a wrong password and an unknown account", async () => {
      await expect(login({ identifier: seed.email, password: "nope" })).rejects.toMatchObject({ code: "invalidCredentials" });
      await expect(login({ identifier: "ghost", password: seed.password })).rejects.toMatchObject({
        code: "invalidCredentials",
      });
    });

    it("maps 429 to tooManyRequests and a lost connection to network", async () => {
      fakeBackend.failNext(429);
      await expect(login({ identifier: seed.email, password: seed.password })).rejects.toMatchObject({
        code: "tooManyRequests",
      });
      fakeBackend.goOfflineOnce();
      await expect(login({ identifier: seed.email, password: seed.password })).rejects.toMatchObject({ code: "network" });
    });

    it("maps other failures to generic", async () => {
      fakeBackend.failNext(500);
      await expect(login({ identifier: seed.email, password: seed.password })).rejects.toMatchObject({ code: "generic" });
    });

    it.each([
      ["no token", { user: { id: "1", name: "A", username: "a", email: "a@b.c", role: "user" } }],
      ["an empty token", { accessToken: "" }],
      ["a string", "ok"],
    ])("refuses a response with %s", async (_label, body) => {
      fakeBackend.failNext(200, body);
      await expect(login({ identifier: seed.email, password: seed.password })).rejects.toMatchObject({ code: "generic" });
    });
  });

  describe("register", () => {
    it("posts the trimmed details and returns the server message (no session)", async () => {
      await expect(register(newAccount)).resolves.toBe("Account created");

      const [request] = fakeBackend.callsTo("/auth/register");
      expect(request.method).toBe("POST");
      expect(request.body).toEqual({
        firstName: "Meera",
        lastName: "Nair",
        username: "meera",
        email: "meera@example.com",
        password: "Str0ng!pass",
      });
      expect(request.init.credentials).toBe("omit");
      expect(request.headers.Authorization).toBeUndefined();
      expect(fakeBackend.users.some((account) => account.username === "meera")).toBe(true);
    });

    it("returns a string response from registration", async () => {
      fakeBackend.failNext(201, "Account created");
      await expect(register(newAccount)).resolves.toBe("Account created");
    });

    it("reports an email that is already registered", async () => {
      await expect(register({ ...newAccount, email: seed.email.toUpperCase() })).rejects.toMatchObject({ code: "emailTaken" });
    });

    it("reports a username that is already taken", async () => {
      await expect(register({ ...newAccount, username: seed.username })).rejects.toMatchObject({ code: "usernameTaken" });
    });

    it("reports other failures as generic and a lost connection as network", async () => {
      fakeBackend.failNext(500);
      await expect(register(newAccount)).rejects.toMatchObject({ code: "generic" });
      fakeBackend.goOfflineOnce();
      await expect(register(newAccount)).rejects.toMatchObject({ code: "network" });
    });
  });

  describe("checkUsernameAvailable", () => {
    it("is true when nobody has the username", async () => {
      await expect(checkUsernameAvailable("brand.new")).resolves.toBe(true);
      expect(fakeBackend.callsTo("/auth/validate-username")[0].query).toEqual({ username: "brand.new" });
    });

    it("is false when the username exists, ignoring case", async () => {
      await expect(checkUsernameAvailable(seed.username.toUpperCase())).resolves.toBe(false);
    });

    it("throws on an unexpected response", async () => {
      fakeBackend.failNext(200, { available: true });
      await expect(checkUsernameAvailable("x")).rejects.toThrow(/Unexpected response/);
    });
  });
});
