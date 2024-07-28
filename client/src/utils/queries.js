import { gql } from '@apollo/client';

export const GET_CLOUDINARY = gql`
query cloudinaryCreds {
    cloudinaryCreds {
        name
        key
    }
}
`;

export const GET_PUBLISHED_CODES = gql`
query publishedCodes {
    publishedCodes {
        id
        userId
        companyId
        code
        createdAt
        firstName
        lastName
        username
    }
}
`;

export const GET_PUBLISHED_CODE = gql`
query publishedCode {
    publishedCode {
        id
        userId
        companyId
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

export const CHECK_USER_EXISTS = gql`
query checkUserExists($usernameOrEmail: String!) {
    checkUserExists(usernameOrEmail: $usernameOrEmail) {
        id
        profileImage
        firstName
        lastName
        username
    }
}
`;

export const GET_USER = gql`
query user($id: ID!) {
    user(id: $id) {
        id
        profileImage
        lastName
        username
        firstName
    }
}
`;

export const GET_ME = gql`
query me {
    me {
        user {
        id
        bio
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
        content
        createdAt
        user {
          id
          profileImage
          firstName
          lastName
          username
        }
        comments {
          id
          content
          createdAt
          user {
            id
            profileImage
            firstName
            lastName
            username
          }
        }
      }
  }
`;

export const GET_USER_POSTS = gql`
query userPosts($id: ID) {
    userPosts(id: $id) {
        id
        userId
        content
        createdAt
    }
}
`;

export const GET_ME_POSTS = gql`
query mePosts {
    mePosts {
        id
        userId
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
        postId
        userId
        content
        createdAt
    }
}
`;

export const GET_COMMENT = gql`
query comment {
    comment {
        id
        postId
        userId
        content
        createdAt
    }
}
`;

export const GET_ME_COMMENTS = gql`
query meComments {
    meComments {
        id
        postId
        userId
        content
        createdAt
    }
}
`;

export const GET_FRIENDS = gql`
query friends {
    friends {
        id
        userId1
        userId2
        request
    }
}
`;

export const GET_FRIEND = gql`
query friend($id: ID!) {
    friend(id: $id) {
        id
        userId1
        userId2
        request
    }
}
`;

export const GET_FRIEND_REQUESTS_INCOMMING = gql`
query friendRequestsIncoming {
    friendRequestsIncoming {
        id
        userId1
        userId2
        request
    }
}
`;

export const GET_FRIEND_REQUESTS_OUTGOING = gql`
query friendRequestsOutgoing {
    friendRequestsOutgoing {
        id
        userId1
        userId2
        request
    }
}
`;