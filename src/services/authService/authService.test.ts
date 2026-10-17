import { AuthError, login, register, resetAuthStore } from "./authService";
import { seedUsers } from "@/data/mockUsers";

const [seed] = seedUsers;

describe("authService", () => {
  beforeEach(() => resetAuthStore());

  describe("login", () => {
    it("returns the user without the password for valid credentials", async () => {
      const user = await login({ email: seed.email, password: seed.password });
      expect(user).toEqual({
        id: "u-1",
        name: seed.name,
        email: seed.email,
        role: "Administrator",
      });
    });

    it("ignores email case and surrounding whitespace", async () => {
      await expect(
        login({ email: `  ${seed.email.toUpperCase()} `, password: seed.password }),
      ).resolves.toMatchObject({ id: "u-1" });
    });

    it("rejects a wrong password", async () => {
      await expect(login({ email: seed.email, password: "nope" })).rejects.toMatchObject({
        name: "AuthError",
        code: "invalidCredentials",
      });
    });

    it("rejects an unknown email", async () => {
      await expect(login({ email: "ghost@example.com", password: seed.password })).rejects.toMatchObject({
        code: "invalidCredentials",
      });
    });
  });

  describe("register", () => {
    it("creates an account that can then log in", async () => {
      const created = await register({ name: " Meera Nair ", email: "Meera@Example.com", password: "Str0ng!pass" });
      expect(created).toMatchObject({ name: "Meera Nair", email: "meera@example.com", role: "Member" });

      await expect(login({ email: "meera@example.com", password: "Str0ng!pass" })).resolves.toMatchObject({
        id: created.id,
      });
    });

    it("rejects an email that is already registered", async () => {
      const attempt = register({ name: "Dup", email: seed.email.toUpperCase(), password: "Str0ng!pass" });
      await expect(attempt).rejects.toBeInstanceOf(AuthError);
      await expect(attempt).rejects.toMatchObject({ code: "emailTaken" });
    });
  });
});
