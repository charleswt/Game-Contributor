import { gql } from '@apollo/client';

export const GET_PUBLISHED_CODES = gql`
query publishedCodes {
    publishedCodes {
        id
        user
        companyUser
        code
        createdAt
    }
}
`;

export const GET_PUBLISHED_CODE = gql`
query publishedCode {
    publishedCode {
        id
        userId
        companyUser
        code
        createdAt
    }
}
`;

export const GET_USERS = gql`
query users {
    users {
        id
        profileImage
        firstName
        lastName
        username
        email
    }
}
`;

export const GET_USER = gql`
query user($id: String!) {
    user(id: $id) {
        id
        profileImage
        firstName
        lastName
        username
        email
    }
}
`;

export const GET_ME = gql`
query me {
    me {
        user
        company
    }
}
`;

export const GET_COMPANY_USERS = gql`
query companyUsers {
    companyUsers {
        id
        profileImage
        firstName
        lastName
        username
        email
    }
}
`;

export const GET_COMPANY_USER = gql`
query companyUser($id: string) {
    companyUser(id: $id) {
        user {
            id
            profileImage
            firstName
            lastName
            username
            email
        }
        company {
            id
            companyName
            userId
        }
    }
}
`;

export const GET_POSTS = gql`
query posts {
    posts {
        id
        user
        content
        createdAt
    }
}
`;

export const GET_USER_POSTS = gql`
query userPosts($id: string) {
    userPosts(id: $id) {
        id
        user
        content
        createdAt
    }
}
`;

export const GET_POST = gql`
query post {
    post {
        id
        user
        content
        createdAt
    }
}
`;

export const GET_COMMENTS = gql`
query comments($id: string) {
    comments(id: $id) {
        id
        post
        user
        content
        createdAt
    }
}
`;

export const GET_COMMENT = gql`
query comment {
    comment {
        id
        post
        user
        content
        createdAt
    }
}
`;

export const GET_FRIENDS = gql`
query friends {
    friends {
        id
        user1
        user2
        request
    }
}
`;

export const GET_FRIEND = gql`
query friend {
    friend {
        id
        user1
        user2
        request
    }
}
`;