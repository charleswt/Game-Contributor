import { packToken } from "../utils/auth"
interface CreateUserInput {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }
  
  interface User {
    profileImage?: string|null;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }
  
  interface Auth {
    token: string;
    user: User;
  }
  
  const resolvers = {
    Query: {},
  
    Mutation: {
      createUser: (input: CreateUserInput): Auth => {
        const newUser: User = {
          profileImage: null,
          firstName: input.firstName,
          lastName: input.lastName,
          username: input.username,
          email: input.email,
          password: input.password,
        };
  
        const token: string='placeholder'
  
        return { token, user: newUser };
      },
    },
  };
  
  export default resolvers;