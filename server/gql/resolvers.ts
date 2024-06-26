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
  id: string;
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
  id?: string;
  content?: string;
}

type PostWithUser = {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    profileImage: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  }
}

interface Comment {
  id?: string;
  postId?: string;
  userId?: string;
  content: string;
  createdAt?: string,
}

interface PublishedCode {
  id: string;
  userId: string;
  companyId: string;
  code: string;
  createdAt: string;
}

interface Friend {
  id?: string;
  userId1: string;
  userId2: string;
  request: boolean;
}

interface LoginInput {
  usernameOrEmail: any;
  password: any;
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
          'SELECT * FROM "published_code" WHERE user_id = $1';
        const selectPublishedCodesValues = context.user.id;

        const result = await client.query(
          selectPublishedCodesText,
          selectPublishedCodesValues
        );

        await client.query("COMMIT");

        return result.rows.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          companyId: row.company_id,
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
          'SELECT * FROM "published_code" WHERE user_id = $1';
        const selectPublishedCodesValues = context.user.id;

        const result = await client.query(
          selectPublishedCodesText,
          selectPublishedCodesValues
        );

        await client.query("COMMIT");

        const publishedCode: PublishedCode = {
          id: result.rows[0].id,
          userId: result.rows[0].user_id,
          companyId: result.rows[0].company_id,
          code: result.rows[0].code,
          createdAt: result.rows[0].created_at,
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
        const selectUserText = 'SELECT * FROM "user"';

        const result = await client.query(selectUserText);

        await client.query("COMMIT");

        return result.rows.map((row: any) => ({
          id: row.id,
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
    checkUserExists:  async (_: any, {usernameOrEmail}: { usernameOrEmail: string}): Promise<User> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const selectUserText = 'SELECT * FROM "user" WHERE email = $1 or username = $1';
        const selectUserValues = [usernameOrEmail];

        const result = await client.query(selectUserText, selectUserValues);

        await client.query("COMMIT");

        const user: User = {
          id: result.rows[0].id,
          firstName: 'result.rows[0].first_name',
          lastName: 'result.rows[0].last_name',
          username: result.rows[0].username,
          email: 'result.rows[0].email',
          password: 'result.rows[0].password',
        };

        return user;
      } catch (error) {
        client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    user:  async (_: any, {id}: { id: string}): Promise<User> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const selectUserText = 'SELECT * FROM "user" WHERE id = $1';
        const selectUserValues = [id];

        const result = await client.query(selectUserText, selectUserValues);

        await client.query("COMMIT");

        const user: User = {
          id: result.rows[0].id,
          firstName: result.rows[0].first_name,
          lastName: result.rows[0].last_name,
          username: result.rows[0].username,
          email: result.rows[0].email,
          password: result.rows[0].password,
        };

        return user;
      } catch (error) {
        client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    me: async (_: any, args: any, context: any): Promise<{ user: User, company?: Company }>  => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const selectUserText = 'SELECT * FROM "user" WHERE id = $1';
        const selectUserValues = [context.user.id];

        const userResult = await client.query(selectUserText, selectUserValues).catch((error)=>{
          throw error
        })

        if (userResult.rows.length === 0) {
          throw new Error('User not found');
        }

        const userRow = userResult.rows[0];
        

        const user: User = {
          id: userRow.id,
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
          id: row.id,
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
          id: userRow.id,
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
    posts: async (_: any): Promise<PostWithUser[]> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const selectPostsWithUserAndCommentsText = `
        WITH top_posts AS (
          SELECT
            p.id AS post_id,
            p.content AS post_content,
            p.created_at AS post_created_at,
            u.id AS user_id,
            u.profile_image AS user_profile_image,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name,
            u.username AS user_username,
            u.email AS user_email
          FROM
            posts p
          JOIN
            "user" u ON p.user_id = u.id
          ORDER BY
            p.created_at ASC
          LIMIT 10
        )
        SELECT
          tp.post_id,
          tp.post_content,
          tp.post_created_at,
          tp.user_id,
          tp.user_profile_image,
          tp.user_first_name,
          tp.user_last_name,
          tp.user_username,
          tp.user_email,
          c.id AS comment_id,
          c.content AS comment_content,
          c.created_at AS comment_created_at,
          cu.id AS comment_user_id,
          cu.first_name AS comment_user_first_name,
          cu.last_name AS comment_user_last_name,
          cu.username AS comment_user_username
        FROM
          top_posts tp
        LEFT JOIN
          comments c ON c.post_id = tp.post_id
        LEFT JOIN
          "user" cu ON c.user_id = cu.id
        ORDER BY
          tp.post_created_at ASC, c.created_at ASC;
      `;

        const result = await client.query(selectPostsWithUserAndCommentsText);

        await client.query("COMMIT");

        // Group posts and their comments
        const postsMap: { [key: string]: any } = {};

        result.rows.forEach((row: any) => {
          if (!postsMap[row.post_id]) {
            postsMap[row.post_id] = {
              id: row.post_id,
              content: row.post_content,
              createdAt: row.post_created_at,
              user: {
                id: row.user_id,
                profileImage: row.user_profile_image,
                firstName: row.user_first_name,
                lastName: row.user_last_name,
                username: row.user_username,
                email: row.user_email,
              },
              comments: [],
            };
          }

          if (row.comment_id) {
            postsMap[row.post_id].comments.push({
              id: row.comment_id,
              content: row.comment_content,
              createdAt: row.comment_created_at,
              user: {
                id: row.comment_user_id,
                firstName: row.comment_user_first_name,
                lastName: row.comment_user_last_name,
                username: row.comment_user_username,
              },
            });
          }
        });

        return Object.values(postsMap);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    userPosts: async (_:any, { id }: { id?: string }): Promise<Post[]>=>{
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const selectPostsText = 'SELECT * FROM "posts" WHERE user_id = $1'
        const result =  await client.query(selectPostsText, [id]);

        await client.query("COMMIT");

        return result.rows.map((row: any)=>({
          id: row.id,
          userId: row.user_id,
          content: row.content,
          createdAt: row.created_at
        }))
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    mePosts: async (_:any, args: any, context: any): Promise<Post[]>=>{
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const selectPostsText = 'SELECT * FROM "posts" WHERE user_id = $1'
        const selectPostsValues = [context.user.id]
        const result =  await client.query(selectPostsText, selectPostsValues);

        await client.query("COMMIT");

        return result.rows.map((row: any)=>({
          id: row.id,
          userId: row.user_id,
          content: row.content,
          createdAt: row.created_at
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

        const selectCommentsText = 'SELECT * FROM "comments" WHERE post_id = $1 OR user_id = $1 ORDER BY created_at ASC';
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
    meComments: async (_: any, args: any, context: any): Promise<Comment[]> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const selectCommentsText = 'SELECT * FROM "comments" WHERE user_id = $1 ORDER BY created_at ASC;';
        const selectCommentsValues = [context.user.id];
        console.log(selectCommentsValues)
        const result = await client.query(selectCommentsText, selectCommentsValues);
        console.log(result)

        await client.query("COMMIT");

        return result.rows.map((row: any) => ({
          id: row.id,
          postId: row.post_id,
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
    friends: async (_: any, args: any, context: any): Promise<Friend[]> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const selectFriendsText = `
        SELECT * FROM "friend" 
        WHERE (user_id1 = $1 OR user_id2 = $1) AND request = FALSE;
        `;
        const selectFriendsValues = [context.user.id];
        const result = await client.query(selectFriendsText, selectFriendsValues);

        await client.query("COMMIT");

        return result.rows.map((row: any) => ({
          id: row.id,
          userId1: row.user_id1,
          userId2: row.user_id2,
          request: row.request
        }));
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    friend: async (_: any, { id }: { id: string }, context: any): Promise<Friend> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const selectFriendsText = `
        SELECT * FROM "friend" 
        WHERE (user_id1 = $1 AND user_id2 = $2) OR (user_id1 = $2 AND user_id2 = $1);
        `;
        const selectFriendsValues = [context.user.id, id];
        const result = await client.query(selectFriendsText, selectFriendsValues);

        await client.query("COMMIT");

        const friend: Friend = {
          id: result.rows[0].id,
          userId1: result.rows[0].user_id1,
          userId2: result.rows[0].user_id2,
          request: result.rows[0].request
        }

        return friend;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    friendRequestsIncoming: async (_: any, args: any, context: any): Promise<Friend[]> =>{
      const client = await pool.connect();
      try{
        client.query('BEGIN');
        const queryString = `
        SELECT * FROM "friend" WHERE user_id1 = $1 AND request = TRUE;
        `;
        const queryValues = [context.user.id]

        const result = await client.query(queryString, queryValues);
        client.query('COMMIT');

        return result.rows.map((row: any)=>({
          id: row.id,
          userId1: row.user_id1,
          userId2: row.user_id2,
          request: row.request
        }))

      } catch(error){
        client.query('ROLLBACK')
        throw error
      } finally {
        client.release(
          
        )
      }
    },
    friendRequestsOutgoing: async (_: any, args: any, context: any): Promise<Friend[]> =>{
      const client = await pool.connect();
      try{
        client.query('BEGIN');
        const queryString = `
        SELECT * FROM "friend" WHERE user_id2 = $1 AND request = TRUE;
        `;
        const queryValues = [context.user.id]

        const result = await client.query(queryString, queryValues);
        client.query('COMMIT');

        return result.rows.map((row: any)=>({
          id: row.id,
          userId1: row.user_id1,
          userId2: row.user_id2,
          request: row.request
        }))

      } catch(error){
        client.query('ROLLBACK')
        throw error
      } finally {
        client.release(
          
        )
      }
    }
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
          id: newUser.id,
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

        return { token, user: { ...user } };
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

    createPost: async (_: any, input: Post, context: any): Promise<any> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertPostText = `
          INSERT INTO "posts" (user_id, content)
          VALUES ($1, $2)
          RETURNING id, user_id, content, created_at;
        `;

        const insertPostValues = [context.user.id, input.content];

        const result = await client.query(insertPostText, insertPostValues);
        const newPost = result.rows[0];

        await client.query("COMMIT");

        const post = {
          id: newPost.id,
          userId: newPost.user_id,
          content: newPost.content,
          createdAt: newPost.created_at
        };
        return post;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error creating post: " + error.message);
      } finally {
        client.release();
      }
    },

    updatePost: async (_: any, input: Post, context: any): Promise<any> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
    
        const updatePostText = `
          UPDATE "posts"
          SET content = $1
          WHERE id = $2 AND user_id = $3
          RETURNING id, user_id, content, created_at;
        `;
    
        const updatePostValues = [input.content, input.id, context.user.id];
    
        const result = await client.query(updatePostText, updatePostValues);
        const updatedPost = result.rows[0];
    
        if (!updatedPost) {
          throw new Error("Post not found or user is not authorized to update this post.");
        }
    
        await client.query("COMMIT");
    
        const post = {
          id: updatedPost.id,
          userId: updatedPost.user_id,
          content: updatedPost.content,
          createdAt: updatedPost.created_at
        };
        return post;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error updating post: " + error.message);
      } finally {
        client.release();
      }
    },

    deletePost: async (_: any, input: Post): Promise<any> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
    
        // Delete related comments first
        const deleteCommentsText = `
          DELETE FROM "comments"
          WHERE post_id = $1;
        `;
    
        const deleteCommentsValues = [input.id];
        await client.query(deleteCommentsText, deleteCommentsValues);
    
        // Then delete the post
        const deletePostText = `
          DELETE FROM "posts"
          WHERE id = $1
          RETURNING id, user_id, content, created_at;
          `;
    
        const result = await client.query(deletePostText, deleteCommentsValues);
        const deletedPost = result.rows[0];
    
        if (!deletedPost) {
          throw new Error("Post not found or user is not authorized to delete this post.");
        }
    
        await client.query("COMMIT");
    
        const post = {
          id: deletedPost.id,
          userId: deletedPost.user_id,
          content: deletedPost.content,
          createdAt: deletedPost.created_at
        };
        return post;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error deleting post: " + error.message);
      } finally {
        client.release();
      }
    },

    createComment: async (_: any, input: Comment): Promise<Comment> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertCommentText = `
          INSERT INTO "comments" (post_id, user_id, content)
          VALUES ($1, $2, $3)
          RETURNING id, post_id, user_id, content, created_at;
        `;

        const insertCommentValues = [input.postId, input.userId, input.content];

        const result = await client.query(
          insertCommentText,
          insertCommentValues
        ).catch((err)=>{
          throw err
        })
        const newComment: any = result.rows[0];

        await client.query("COMMIT");

        const comment: Comment = {
          id: newComment.id,
          postId: newComment.post_id,
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

    createPublishedCode: async (_: any, input: PublishedCode): Promise<PublishedCode> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertPublishedCodeText = `
          INSERT INTO "published_code" (user_id, company_id, code)
          VALUES ($1, $2, $3)
          RETURNING user_id, company_id, code;
        `;

        const insertPublishedCodeValues = [
          input.userId,
          input.companyId,
          input.code,
        ];

        const result = await client.query(
          insertPublishedCodeText,
          insertPublishedCodeValues
        );
        const newPublishedCode = result.rows[0];

        await client.query("COMMIT");

        const publishedCode: PublishedCode = {
          id: newPublishedCode.id,
          userId: newPublishedCode.user_id,
          companyId: newPublishedCode.company_id,
          code: newPublishedCode.code,
          createdAt: newPublishedCode.created_at
        };

        return publishedCode;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error creating published code: " + error.message);
      } finally {
        client.release();
      }
    },
    createFriendship: async (_: any, { id }: { id: string }, context: any): Promise<Friend> => {
      const client = await pool.connect();
      try {

        await client.query("BEGIN");

        const insertFriendText = `
          INSERT INTO "friend" (user_id1, user_id2, request)
          VALUES ($1, $2, TRUE)
          RETURNING id, user_id1, user_id2, request;
        `;

        const insertFriendValues = [id, context.user.id];

        const result = await client.query(insertFriendText, insertFriendValues);
        const newFriend = result.rows[0];

        await client.query("COMMIT");

        const friend: Friend = {
          id: newFriend.id,
          userId1: newFriend.user_id1,
          userId2: newFriend.user_id2,
          request: newFriend.request
        };

        return friend;
      } catch (error: any) {
        await client.query("ROLLBACK");
        console.error("Error creating friend:", error);
        throw new Error("Error creating friend: " + error.message);
      } finally {
        client.release();
      }
    },
    acceptFriendship: async (_: any, { id }: { id: string }): Promise<Friend> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertFriendText = `
        UPDATE "friend"
        SET request = FALSE
        WHERE id = $1 AND request = TRUE
        RETURNING id, user_id1, user_id2, request;
      `;

        const insertFriendValues = [id];

        const result = await client.query(insertFriendText, insertFriendValues);
        const newFriend = result.rows[0];

        await client.query("COMMIT");

        const friend: Friend = {
          id: newFriend.id,
          userId1: newFriend.user_id1,
          userId2: newFriend.user_id2,
          request: newFriend.request
        };

        return friend;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error accepting request: " + error.message);
      } finally {
        client.release();
      }
    },
    declineFriendship: async (_: any, { id }: { id: string }): Promise<Friend> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertFriendText = `
        DELETE FROM "friend"
        WHERE id = $1
        RETURNING id, user_id1, user_id2, request;
      `;

        const insertFriendValues = [id];

        const result = await client.query(insertFriendText, insertFriendValues);

        await client.query("COMMIT");

        const friend: Friend = {
          id: result.rows[0].id,
          userId1: result.rows[0].user_id1,
          userId2: result.rows[0].user_id2,
          request: result.rows[0].request
        };
console.log('here return')
        return friend;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error declining request " + error.message);
      } finally {
        client.release();
      }
    },
    login: async (_:any, input: LoginInput): Promise<Auth> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        
        const queryText = 'SELECT * FROM "user" WHERE username = $1 OR email = $1'
        const queryValue = input.usernameOrEmail;

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
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          email: user.email,
          password: user.password
        };

        const token = packToken(user.id);

        await client.query("COMMIT");

        return { token, user: { ...userData} };
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
