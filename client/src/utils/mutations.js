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

export const UPDATE_POST = gql`
  mutation updatePost($id: ID!, $content: String!) {
    updatePost(id: $id, content: $content) {
      id
      userId
      content
      createdAt
    }
  }
`;

export const DELETE_POST = gql`
  mutation deletePost($id: ID!) {
    deletePost(id: $id) {
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

export const UPDATE_COMMENT = gql`
  mutation updateComment($id: ID!, $content: String!) {
    updateComment(id: $id, content: $content) {
      id
      postId
      userId
      content
      createdAt
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation deleteComment($id: ID!) {
    deleteComment(id: $id) {
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
  mutation createFriendship($id: ID!) {
    createFriendship(id: $id) {
      id
      userId1
      userId2
      request
    }
  }
`;

export const ACCEPT_FRIENDSHIP = gql`
  mutation acceptFriendship($id: ID!) {
    acceptFriendship(id: $id) {
      id
      userId1
      userId2
      request
    }
  }
`;

export const DECLINE_FRIENDSHIP = gql`
  mutation declineFriendship($id: ID!) {
    declineFriendship(id: $id) {
      id
      userId1
      userId2
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