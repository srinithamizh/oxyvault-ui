import { UserRole } from "@/types/user";

export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

// Seed accounts for the fake backend used in tests (see fakeBackend.ts).
export const seedUsers: MockUser[] = [
  {
    id: "u-1",
    firstName: "Thamizharasan",
    lastName: "Srinivasan",
    username: "srinithamizh",
    email: "srinithamizh@gmail.com",
    password: "Test@123!",
    role: UserRole.Admin,
  },
    {
    id: "u-2",
    firstName: "Thamizh",
    lastName: "Srini",
    username: "thamizh",
    email: "srinithamizharasan@gmail.com",
    password: "Test@123!",
    role: UserRole.User,
  },
];

export const fullNameOf = ({ firstName, lastName }: Pick<MockUser, "firstName" | "lastName">) =>
  `${firstName} ${lastName}`;
