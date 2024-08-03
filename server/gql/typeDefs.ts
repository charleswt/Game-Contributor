const typeDefs = `
type User {
  id: ID!
  bio: String
  company: Boolean
  profileImage: String
  firstName: String!
  lastName: String!
  username: String!
  email: String!
  password: String!
}

type FriendAndUser {
  friend: Friend!
  user: User!
}

input FileInput {
  lastModified: Float!
  name: String!
  size: Int!
  type: String!
  webkitRelativePath: String!
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
  user: User
}

type PostWithUser {
  id: ID!
  content: String!
  createdAt: String!
  user: User!
  comments: [Comment!]!
}

type PublishedCode {
  id: ID!
  userId: ID!
  companyId: ID!
  code: String!
  createdAt: String!
  firstName: String!
  lastName: String!
  username: String!
}

type Friend {
  id: ID!
  userId1: ID!
  userId2: ID!
  request: Boolean!
}

type CompanyUser {
  user: User!
  company: Company
}

type Auth {
  token: ID!
  user: User
}

type Cloudinary {
  name: String
  key: String
}

type Query {
  cloudinaryCreds: Cloudinary
  publishedCodes: [PublishedCode!]
  recievedCode: [PublishedCode!]
  publishedCode(id: ID!): PublishedCode!
  users: [User]
  checkUserExists(usernameOrEmail: String): User
  user(id: ID!): User!
  me: CompanyUser
  companyUsers: [User!]!
  companyUser(id: ID!): CompanyUser
  posts: [PostWithUser!]!
  userPosts(id: String): [Post]
  mePosts: [Post]
  post(id: ID!): Post
  comments: [Comment!]!
  comment(id: ID!): Comment
  meComments: [Comment]
  friends: [FriendAndUser]
  friend(id: ID!): FriendAndUser
  friendRequestsIncoming: [FriendAndUser]
  friendRequestsOutgoing: [FriendAndUser]
}

type Mutation {
  createUser(firstName: String!, lastName: String!, username: String!, email: String!, password: String!): Auth
  createCompany(companyName: String!): Company
  createPost(content: String!): Post
  updatePost(id: ID!, content: String): Post
  deletePost(id: ID!): Post
  createComment(postId: ID!, userId: ID!, content: String!): Comment
  updateComment(id: ID!, content: String!): Comment
  deleteComment(id: ID!): Comment
  createPublishedCode(userId: ID!, companyId: ID!, code: String!): PublishedCode
  createFriendship(id: ID!): Friend
  acceptFriendship(id: ID!): Friend
  declineFriendship(id: ID!): Friend
  updateUserPfp(pfp: String!): User
  updateBio(bio: String!): User
  login(usernameOrEmail: String!, password: String!): Auth
}
`;

export default typeDefs;
