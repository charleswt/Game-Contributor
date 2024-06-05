import { gql } from '@apollo/client'

export const CREATE_USER = gql`
  mutation createUser($firstName: String!, $lastName: String!, $username: String!, $email: String!, $password: String!) {
    createUser(firstName: $firstName, lastName: $lastName, username: $username, email: $email, password: $password) {
      token
      user {
        id
        profileImage
        firstName
        lastName
        username
        email
      }
    }
  }
`;

export const CREATE_COMPANY = gql`
  mutation createCompany($companyName: String!, $userId: ID!) {
    createCompany(companyName: $companyName, userId: $userId) {
      id
      companyName
      userId
    }
  }
`;

export const CREATE_POST = gql`
  mutation createPost($content: String!) {
    createPost(content: $content) {
      id
      userId
      content
      createdAt
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation createComment($postId: ID!, $userId: ID!, $content: String!) {
    createComment(postId: $postId, userId: $userId, content: $content) {
      id
      postId
      userId
      content
      createdAt
    }
  }
`;

export const CREATE_PUBLISHED_CODE = gql`
  mutation createPublishedCode($userId: ID!, $companyUserId: ID!, $code: String!) {
    createPublishedCode(userId: $userId, companyUserId: $companyUserId, code: $code) {
      id
      userId
      companyUserId
      code
      createdAt
    }
  }
`;

export const CREATE_FRIENDSHIP = gql`
  mutation createFriendship($userId1: ID!, $userId2: ID!) {
    createFriendship(userId1: $userId1, userId2: $userId2) {
      id
      user1
      user2
      request
    }
  }
`;

export const LOGIN = gql`
  mutation login($usernameOrEmail: String!, $password: String!) {
    login(usernameOrEmail: $usernameOrEmail, password: $password) {
      token
      user {
        id
        profileImage
        firstName
        lastName
        username
        email
      }
    }
  }
`;