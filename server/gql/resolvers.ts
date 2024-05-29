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
  company?: boolean;
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
  createdAt: string,
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
  Query: {
    publishedCodes: async (_: any, context: any): Promise<PublishedCode[]> => {
      const client = await pool.connect();
      try {
        client.query("BEGIN");
        const selectPublishedCodesText =
          'SELECT * "published_code" WHERE user_id = $1';
        const selectPublishedCodesValues = context.user.id;

        const result = await client.query(
          selectPublishedCodesText,
          selectPublishedCodesValues
        );

        await client.query("COMMIT");

        return result.rows.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          companyUserId: row.company_user_id,
          code: row.code,
          createdAt: row.created_at,
        }));
      } catch (error) {
        client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    publishedCode: async (_: any, context: any): Promise<PublishedCode> => {
      const client = await pool.connect();
      try {
        client.query("BEGIN");
        const selectPublishedCodesText =
          'SELECT * "published_code" WHERE user_id = $1';
        const selectPublishedCodesValues = context.user.id;

        const result = await client.query(
          selectPublishedCodesText,
          selectPublishedCodesValues
        );

        await client.query("COMMIT");

        const publishedCode: PublishedCode = {
          userId: result.rows[0].user_id,
          companyUserId: result.rows[0].company_user_id,
          code: result.rows[0].code,
        };

        return publishedCode;
      } catch (error) {
        client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    users: async (_: any): Promise<User[]> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const selectUserText = 'SELECT * "user"';

        const result = await client.query(selectUserText);

        await client.query("COMMIT");

        return result.rows.map((row: any) => ({
          firstName: row.first_name,
          lastName: row.last_name,
          username: row.username,
          email: row.email,
          password: row.password,
        }));
      } catch (error) {
        client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    user:  async (_: any, id: any): Promise<User> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const selectUserText = 'SELECT * "user" WHERE user_id = $1';
        const selectUserValues = id;

        const result = await client.query(selectUserText, selectUserValues);

        await client.query("COMMIT");

        const publishedCode: User = {
          firstName: result.rows[0].first_name,
          lastName: result.rows[0].last_name,
          username: result.rows[0].username,
          email: result.rows[0].email,
          password: result.rows[0].password,
        };

        return publishedCode;
      } catch (error) {
        client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    me: async (_: any, context: any): Promise<{ user: User, company?: Company }>  => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const selectUserText = 'SELECT * FROM "user" WHERE user_id = $1';
        const selectUserValues = [context.user.id];
        const userResult = await client.query(selectUserText, selectUserValues);

        if (userResult.rows.length === 0) {
          throw new Error('User not found');
        }

        const userRow = userResult.rows[0];

        const user: User = {
          firstName: userRow.first_name,
          lastName: userRow.last_name,
          username: userRow.username,
          email: userRow.email,
          password: userRow.password,
        };

        let company: Company | undefined;
        
        if (userRow.company) {
          const selectCompanyText = 'SELECT * FROM "company" WHERE user_id = $1';
          const companyResult = await client.query(selectCompanyText, selectUserValues);

          if (companyResult.rows.length > 0) {
            const companyRow = companyResult.rows[0];
            company = {
              userId: companyRow.user_id,
              companyName: companyRow.company_name,
            };
          }
        }

        await client.query("COMMIT");

        return { user, company };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    companyUsers: async (_:any): Promise<User[]>=>{
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const selectCompanyUsersText = 'SELECT * FROM "user" WHERE company = TRUE';
        const result = await client.query(selectCompanyUsersText);
        await client.query("COMMIT");

        return result.rows.map((row: any) => ({
          firstName: row.first_name,
          lastName: row.last_name,
          username: row.username,
          email: row.email,
          password: row.password,
        }));
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    companyUser: async (_: any, {id}: { id: string}): Promise<{user: User, company?: Company}>=>{
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const selectUserText = 'SELECT * FROM "user" WHERE user_id = $1 AND company = TRUE';
        const selectUserValues = [id];
        const userResult = await client.query(selectUserText, selectUserValues);

        if (userResult.rows.length === 0) {
          throw new Error('User not found or user is not associated with a company');
        }

        const userRow = userResult.rows[0];

        const user: User = {
          firstName: userRow.first_name,
          lastName: userRow.last_name,
          username: userRow.username,
          email: userRow.email,
          password: userRow.password,
        };

        let company: Company | undefined;

        if (userRow.company) {
          const selectCompanyText = 'SELECT * FROM "company" WHERE user_id = $1';
          const companyResult = await client.query(selectCompanyText, selectUserValues);

          if (companyResult.rows.length > 0) {
            const companyRow = companyResult.rows[0];
            company = {
              userId: companyRow.user_id,
              companyName: companyRow.company_name,
            };
          }
        }

        await client.query("COMMIT");

        return { user, company }
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    posts: async (_:any): Promise<Post[]>=>{
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const selectPostsText = 'SELECT * FROM "posts"'
        const result =  await client.query(selectPostsText);

        await client.query("COMMIT");

        return result.rows.map((row: any)=>({
          userId: row.user_id,
          content: row.content
        }))
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    userPosts: async (_:any, { id }: { id: string }): Promise<Post[]>=>{
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const selectPostsText = 'SELECT * FROM "posts" WHERE user_id = $1'
        const selectPostsValues = [id]
        const result =  await client.query(selectPostsText, selectPostsValues);

        await client.query("COMMIT");

        return result.rows.map((row: any)=>({
          userId: row.user_id,
          content: row.content
        }))
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    post: async (_:any, { id }: { id: string }): Promise<Post>=>{
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const selectPostsText = 'SELECT * FROM "posts" WHERE id = $1'
        const selectPostsValues = [id]
        const result =  await client.query(selectPostsText, selectPostsValues);

        await client.query("COMMIT");

        return result.rows[0]
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    comments: async (_: any, { id }: { id: string }): Promise<Comment[]> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const selectCommentsText = 'SELECT * FROM "comments" WHERE post_id = $1 ORDER BY created_at ASC';
        const selectCommentsValues = [id];
        const result = await client.query(selectCommentsText, selectCommentsValues);

        await client.query("COMMIT");

        return result.rows.map((row: any) => ({
          userId: row.user_id,
          content: row.content,
          createdAt: row.created_at,
        }));
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    comment: async (_: any, { id }: { id: string }): Promise<Comment> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const selectCommentsText = 'SELECT * FROM "comments" WHERE post_id = $1';
        const selectCommentsValues = [id];
        const result = await client.query(selectCommentsText, selectCommentsValues);

        await client.query("COMMIT");

        const comment: Comment = {
          userId: result.rows[0].user_id,
          content: result.rows[0].content,
          createdAt: result.rows[0].created_at,
        }

        return comment;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    friends: async (_: any, context: any): Promise<Friend[]> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const selectFriendsText = `
          SELECT * FROM "friends" 
          WHERE userId1 = $1 OR userId2 = $1
        `;
        const selectFriendsValues = [context.user.id];
        const result = await client.query(selectFriendsText, selectFriendsValues);

        await client.query("COMMIT");

        return result.rows.map((row: any) => ({
          userId1: row.userId1,
          userId2: row.userId2,
        }));
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    // friend: async (_: any, context: any): Promise<Friend[]> => {
    //   const client = await pool.connect();
    //   try {
    //     await client.query("BEGIN");

    //     const selectFriendsText = `
    //       SELECT * FROM "friends" 
    //       WHERE userId1 = $1 OR userId2 = $1 AND userId1 = $2 OR userId2 = $2
    //     `;
    //     const selectFriendsValues = [context.user.id];
    //     const result = await client.query(selectFriendsText, selectFriendsValues);

    //     await client.query("COMMIT");

    //     return result.rows.map((row: any) => ({
    //       userId1: row.userId1,
    //       userId2: row.userId2,
    //     }));
    //   } catch (error) {
    //     await client.query("ROLLBACK");
    //     throw error;
    //   } finally {
    //     client.release();
    //   }
    // },
  },

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

        return { token, user: { ...user, password: "" } };
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error creating user: " + error.message);
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

        const insertCompanyValues = [input.companyName, input.userId];

        const result = await client.query(
          insertCompanyText,
          insertCompanyValues
        );
        const newCompany = result.rows[0];

        await client.query("COMMIT");

        const company: Company = {
          companyName: newCompany.company_name,
          userId: newCompany.user_id,
        };

        return company;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error creating company: " + error.message);
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

        const insertPostValues = [input.userId, input.content];

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
        throw new Error("Error creating post: " + error.message);
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

        const insertCommentValues = [input.userId, input.content];

        const result = await client.query(
          insertCommentText,
          insertCommentValues
        );
        const newComment = result.rows[0];

        await client.query("COMMIT");

        const comment: Comment = {
          userId: newComment.user_id,
          content: newComment.content,
          createdAt: newComment.created_at
        };

        return comment;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error creating comment: " + error.message);
      } finally {
        client.release();
      }
    },

    createPublishedCode: async (
      _: any,
      input: PublishedCode
    ): Promise<PublishedCode> => {
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
          input.code,
        ];

        const result = await client.query(
          insertPublishedCodeText,
          insertPublishedCodeValues
        );
        const newPublishedCode = result.rows[0];

        await client.query("COMMIT");

        const publishedCode: PublishedCode = {
          userId: newPublishedCode.user_id,
          companyUserId: newPublishedCode.company_user_id,
          code: newPublishedCode.code,
        };

        return publishedCode;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error creating published code: " + error.message);
      } finally {
        client.release();
      }
    },

    createFriendship: async (_: any, input: Friend): Promise<Friend> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertFriendText = `
          INSERT INTO "friend" (user_id1, user_id2)
          VALUES ($1, $2)
          RETURNING user_id1, user_id2;
        `;

        const insertFriendValues = [input.userId1, input.userId2];

        const result = await client.query(insertFriendText, insertFriendValues);
        const newFriend = result.rows[0];

        await client.query("COMMIT");

        const friend: Friend = {
          userId1: newFriend.user_id1,
          userId2: newFriend.user_id2,
        };

        return friend;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error creating friend: " + error.message);
      } finally {
        client.release();
      }
    },

    login: async (input: LoginInput): Promise<Auth> => {
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const queryText = input.username
          ? "SELECT * FROM users WHERE username = $1"
          : "SELECT * FROM users WHERE email = $1";
        const queryValue = input.username ? input.username : input.email;

        const result = await client.query(queryText, [queryValue]);
        const user = result.rows[0];

        if (!user) {
          throw new Error("User not found");
        }

        const isPasswordValid = await comparePasswordHash(
          input.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        const userData = {
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          email: user.email,
        };

        const token = packToken(user.id);

        await client.query("COMMIT");

        return { token, user: { ...userData, password: "" } };
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error during login: " + error.message);
      } finally {
        client.release();
      }
    },
  },
};

export default resolvers;
