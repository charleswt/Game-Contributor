const typeDefs = `
type User {
  id: ID!
  profileImage: String
  firstName: String!
  lastName: String!
  username: String!
  email: String!
  password: String!
}

type Company {
  id: ID!
  companyName: String!
  userId: ID!
}

type Post {
  id: ID!
  userId: ID!
  content: String!
  createdAt: String!
}

type Comment {
  id: ID!
  postId: ID!
  userId: ID!
  content: String!
  createdAt: String!
}

type PublishedCode {
  id: ID!
  userId: ID!
  companyUserId: ID!
  code: String!
  createdAt: String!
}

type Friend {
  id: ID!
  userId1: ID!
  userId2: ID!
  request: Boolean!
}

type CompanyUser {
  user: User
  company: Company
}

type Auth {
  token: ID!
  user: User
}

type Query {
  publishedCodes: [PublishedCode!]!
  publishedCode(id: ID!): PublishedCode!
  users: [User]
  checkUserExists(usernameOrEmail: String): User
  user(id: ID!): User!
  me: CompanyUser
  companyUsers: [User!]!
  companyUser(id: ID!): CompanyUser
  posts: [Post!]!
  userPosts(id: ID!): [Post!]
  post(id: ID!): Post
  comments: [Comment!]!
  comment(id: ID!): Comment
  friends: [Friend!]!
  friend(id: ID!): Friend
}

type Mutation {
  createUser(firstName: String!, lastName: String!, username: String!, email: String!, password: String!): Auth
  createCompany(companyName: String!, userId: ID!): Company
  createPost(userId: ID!, content: String!): Post
  createComment(postId: ID!, userId: ID!, content: String!): Comment
  createPublishedCode(userId: ID!, companyUserId: ID!, code: String!): PublishedCode
  createFriendship(userId1: ID!, userId2: ID!): Friend
  login(usernameOrEmail: String!, password: String!): Auth
}
`

export default typeDefs;