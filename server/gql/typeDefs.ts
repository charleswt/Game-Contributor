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
  user: User!
}

type Post {
  id: ID!
  user: User
  content: String!
  createdAt: String!
}

type Comment {
  id: ID!
  post: Post!
  user: User!
  content: String!
  createdAt: String!
}

type PublishedCode {
  id: ID!
  user: User!
  companyUser: CompanyUser!
  code: String!
  createdAt: String!
}

type Friend {
  id: ID!
  user1: User!
  user2: User!
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
  users: [User!]!
  user(id: ID!): User!
  me: CompanyUser
  companyUsers: [User!]]!
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
  createFriend(userId1: ID!, userId2: ID!): Friend
  login(usernameOrEmail: String!, password: String!): Auth
}
`

export default typeDefs;