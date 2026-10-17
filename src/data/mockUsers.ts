export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

// Dummy data used until the backend API is available.
export const seedUsers: MockUser[] = [
  {
    id: "u-1",
    name: "Thamizharasan Srinivasan",
    email: "srinithamizh@gmail.com",
    password: "Test@123!",
    role: "Administrator",
  },
];
