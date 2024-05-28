import { packToken, comparePasswordHash, hashPassword } from "../utils/auth";
import pool from "../config/connect";

interface CreateUserParams {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

interface User {
  profileImage?: string | null;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

interface Company {
  companyName: string;
  userId: string;
}

interface Post {
  userId: string;
  content: string;
}

interface Comment {
  userId: string;
  content: string;
}

interface PublishedCode {
  userId: string;
  companyUserId: string;
  code: string;
}

interface Friend {
  userId1: string;
  userId2: string;
}

interface LoginInput {
  username?: string;
  email?: string;
  password: string;
}

interface Auth {
  token: string;
  user: User;
}

const resolvers = {
  Query: {},

  Mutation: {
    createUser: async (_: any, input: CreateUserParams): Promise<Auth> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const hashedPassword = await hashPassword(input.password);

        const insertUserText = `
          INSERT INTO "user" (first_name, last_name, username, email, password)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, first_name, last_name, username, email;
        `;

        const insertUserValues = [
          input.firstName,
          input.lastName,
          input.username,
          input.email,
          hashedPassword,
        ];

        const result = await client.query(insertUserText, insertUserValues);
        const newUser = result.rows[0];

        await client.query("COMMIT");

        const userData = {
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          username: newUser.username,
          email: newUser.email,
        };

        const token = packToken(newUser.id);

        const user: User = {
          ...userData,
          password: hashedPassword,
        };

        return { token, user: { ...user, password: '' } };
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error('Error creating user: ' + error.message);
      } finally {
        client.release();
      }
    },

    createCompany: async (_: any, input: Company): Promise<Company> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertCompanyText = `
          INSERT INTO "company" (company_name, user_id)
          VALUES ($1, $2)
          RETURNING id, company_name, user_id;
        `;

        const insertCompanyValues = [
          input.companyName, 
          input.userId
        ];

        const result = await client.query(insertCompanyText, insertCompanyValues);
        const newCompany = result.rows[0];

        await client.query("COMMIT");

        const company: Company = {
          companyName: newCompany.company_name,
          userId: newCompany.user_id,
        };

        return company;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error('Error creating company: ' + error.message);
      } finally {
        client.release();
      }
    },

    createPost: async (_: any, input: Post): Promise<Post> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertPostText = `
          INSERT INTO "posts" (user_id, content)
          VALUES ($1, $2)
          RETURNING user_id, content;
        `;

        const insertPostValues = [
          input.userId, 
          input.content
        ];

        const result = await client.query(insertPostText, insertPostValues);
        const newPost = result.rows[0];

        await client.query("COMMIT");

        const post: Post = {
          userId: newPost.user_id,
          content: newPost.content,
        };
        return post;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error('Error creating post: ' + error.message);
      } finally {
        client.release();
      }
    },

    createComment: async (_: any, input: Comment): Promise<Comment> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertCommentText = `
          INSERT INTO "comments" (user_id, content)
          VALUES ($1, $2)
          RETURNING user_id, content;
        `;

        const insertCommentValues = [
          input.userId,
          input.content
        ];

        const result = await client.query(insertCommentText, insertCommentValues);
        const newComment = result.rows[0];

        await client.query("COMMIT");

        const comment: Comment = {
          userId: newComment.user_id,
          content: newComment.content
        }

        return comment;
      } catch(error: any){
        await client.query("ROLLBACK");
        throw new Error('Error creating comment: ' + error.message);
      } finally {
        client.release()
      }
    },

    createPublishedCode: async (_: any, input: PublishedCode): Promise<PublishedCode> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertPublishedCodeText = `
          INSERT INTO "published_code" (user_id, company_user_id, code)
          VALUES ($1, $2, $3)
          RETURNING user_id, company_user_id, code;
        `;

        const insertPublishedCodeValues = [
          input.userId,
          input.companyUserId,
          input.code
        ];

        const result = await client.query(insertPublishedCodeText, insertPublishedCodeValues);
        const newPublishedCode = result.rows[0];

        await client.query("COMMIT");

        const publishedCode: PublishedCode = {
          userId: newPublishedCode.user_id,
          companyUserId: newPublishedCode.company_user_id,
          code: newPublishedCode.code
        }

        return publishedCode;
      } catch(error: any){
        await client.query("ROLLBACK");
        throw new Error('Error creating published code: ' + error.message);
      } finally {
        client.release()
      }
    },

    createFriend: async (_: any, input: Friend): Promise<Friend> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertFriendText = `
          INSERT INTO "friend" (user_id1, user_id2)
          VALUES ($1, $2)
          RETURNING user_id1, user_id2;
        `;

        const insertFriendValues = [
          input.userId1,
          input.userId2
        ];

        const result = await client.query(insertFriendText, insertFriendValues);
        const newFriend = result.rows[0];

        await client.query("COMMIT");

        const friend: Friend = {
          userId1: newFriend.user_id1,
          userId2: newFriend.user_id2
        };

        return friend;
      } catch(error: any){
        await client.query("ROLLBACK")
        throw new Error('Error creating friend: ' + error.message);
      } finally {
        client.release()
      }
    },

    login: async (input: LoginInput): Promise<Auth> => {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        const queryText = input.username ? 'SELECT * FROM users WHERE username = $1' : 'SELECT * FROM users WHERE email = $1';
        const queryValue = input.username ? input.username : input.email;
        
        const result = await client.query(queryText, [queryValue]);
        const user = result.rows[0];
    
        if (!user) {
          throw new Error('User not found');
        }
    
        const isPasswordValid = await comparePasswordHash(input.password, user.password);
        
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        const userData = {
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          email: user.email,
        };

        const token = packToken(user.id);

        await client.query('COMMIT');

        return { token, user: { ...userData, password: '' } };
    
      } catch (error: any) {
        await client.query('ROLLBACK');
        throw new Error('Error during login: ' + error.message);
    
      } finally {
        client.release();
      }
    }
  },
};

export default resolvers;