import { gql } from '@apollo/client';

export const CREATE_USER = gql`
mutation createUser(firstName: String!, lastName: String!, username: String!, email: String!, password: String!) {
    createUser($firstName: firstName, $lastName: lastName, $username: username, $email: email, $password: password) {
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
mutation createCompany(companyName: String!, userId: ID!) {
    createCompany($companyName: companyName, $userId: userId) {
        id
        companyName
        userId
    }
}
`;

export const CREATE_POST = gql`
mutation createPost(userId: ID!, content: String!) {
    createPost($userId: userId, $content: content) {
        id
        user: User
        content: String!
        createdAt: String!
    }
}
`;

export const CREATE_COMMENT = gql`
mutation createComment(postId: ID!, userId: ID!, content: String!) {
    createComment($postId: postId, $userId: userId, $content: content) {
        id: ID!
        postId: ID!
        userId: ID!
        content: String!
        createdAt: String!
    }
}
`;

export const CREATE_PUBLISHED_CODE = gql`
mutation createPublishedCode(userId: ID!, companyUserId: ID!, code: String!) {
    createPublishedCode($userId: userId, $companyUserId: companyUserId, $code: code) {
        id
        userId
        companyUserId
        code
        createdAt
    }
}
`;

export const GET_POSTS = gql`
mutation createFriendship(userId1: ID!, userId2: ID!) {
    createFriendship($userId1: userId1, $userId2: userId2) {
        id
        user1
        user2
        request
    }
}
`;

export const GET_USER_POSTS = gql`
mutation login(usernameOrEmail: String!, password: String!) {
    login($usernameOrEmail: usernameOrEmail, $password: password) {
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