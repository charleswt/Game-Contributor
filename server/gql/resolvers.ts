import { packToken, comparePasswordHash, hashPassword } from "../utils/auth";
import "dotenv/config"
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
  bio?: string;
  profileImage: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  password?: string;
}

interface Company {
  id?: string;
  companyName: string;
  userId: string;
}

interface UserCompany {
  id: string;
  bio?: string;
  profileImage: string;
  firstName: string;
  lastName: string;
  username: string;
  companyName: string;
}

interface SearchQuery {
  nameResponse?: User|undefined;
  usernameResponse?: User|undefined;
  companyResponse?: UserCompany|undefined;
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
  createdAt?: string;
  user?: User;
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

interface Cloudinary {
  name: string | undefined;
  key: string | undefined; 
}

const resolvers = {
  Query: {
    cloudinaryCreds: async (_: any): Promise<Cloudinary> => {
      return { name: process.env.CLOUD_NAME, key: process.env.CLOUD_API_KEY } as Cloudinary;
    },
    publishedCodesByCompany: async (_: any, {companyId}: {companyId: string}, context: any): Promise<PublishedCode[]> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const selectPublishedCodesText = `
          SELECT pc.*, u.first_name, u.last_name, u.username
          FROM "published_code" pc
          JOIN "user" u ON pc.user_id = u.id
          WHERE pc.user_id = $1 AND pc.company_id = $2
        `;
        const selectPublishedCodesValues = [context.user.id, companyId];
    
        const result = await client.query(selectPublishedCodesText, selectPublishedCodesValues);

        await client.query("COMMIT");

        return result.rows.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          companyId: row.company_id,
          code: row.code,
          createdAt: row.created_at,
          firstName: row.first_name,
          lastName: row.last_name,
          username: row.username
        }));
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    recievedCode: async (_: any, args: any, context: any): Promise<PublishedCode> => {
      const client = await pool.connect();
      try {
        client.query("BEGIN");
        const selectPublishedCodesText =
          'SELECT * FROM "published_code" WHERE company_id = $1;';
        const selectPublishedCodesValues = [context.user.id];

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
    publishedCode: async (_: any, args: any, context: any): Promise<PublishedCode[]> => {
      const client = await pool.connect();
      try {
        client.query("BEGIN");
        const selectPublishedCodesText =
          'SELECT * FROM "published_code" WHERE user_id = $1';
        const selectPublishedCodesValues = [context.user.id];

        const result = await client.query(
          selectPublishedCodesText,
          selectPublishedCodesValues
        );

        await client.query("COMMIT");

        return result.rows.map((row:any)=>({
          id: row.id,
          userId: row.user_id,
          companyId: row.company_id,
          code: row.code,
          createdAt: row.created_at
        }))
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
          profileImage: row.profile_image,
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
          id: result.rows[0].id || "",
          profileImage: result.rows[0].profile_image || "",
          firstName: result.rows[0].first_name || "",
          lastName: result.rows[0].last_name || "",
          username: result.rows[0].username || "",
        };
        return user;
      } catch (error) {
        client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    user:  async (_: any, {id}: { id: string }): Promise<{user: User, company: Company | undefined }> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const selectUserText = 'SELECT * FROM "user" WHERE id = $1';
        const selectUserValues = [id];

        const userResult = await client.query(selectUserText, selectUserValues).catch((error)=>{
          throw error
        })

        if (userResult.rows.length === 0) {
          throw new Error('User not found');
        }

        const userRow = userResult.rows[0];

        const user: User = {
          id: userRow.id,
          bio: userRow.bio,
          profileImage: userRow.profile_image,
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
              id: companyRow.id,
              userId: companyRow.user_id,
              companyName: companyRow.company_name,
            };
          }
        }

        await client.query("COMMIT");
        
        return { user, company };
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
          bio: userRow.bio,
          profileImage: userRow.profile_image,
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
              id: companyRow.id,
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
          profileImage: row.profile_image,
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
          bio: userRow.bio,
          profileImage: userRow.profile_image,
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

        const result = await client.query(selectCommentsText, selectCommentsValues);

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
    friends: async (_: any, args: any, context: any): Promise<Array<{ friend: Friend, user: User }>> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
    
        const selectFriendsWithUserText = `
          WITH friends_cte AS (
            SELECT
              f.id AS friend_id,
              f.user_id1,
              f.user_id2,
              f.request,
              CASE
                WHEN f.user_id1 = $1 THEN f.user_id2
                ELSE f.user_id1
              END AS friend_user_id
            FROM
              friend f
            WHERE
              (f.user_id1 = $1 OR f.user_id2 = $1) AND f.request = FALSE
          )
          SELECT
            fct.friend_id,
            fct.user_id1,
            fct.user_id2,
            fct.request,
            u.id AS user_id,
            u.username,
            u.email,
            u.profile_image,
            u.first_name,
            u.last_name
          FROM
            friends_cte fct
          JOIN
            "user" u ON fct.friend_user_id = u.id;
        `;
        const selectFriendsValues = [context.user.id];
        const result = await client.query(selectFriendsWithUserText, selectFriendsValues);
    
        await client.query("COMMIT");
    
        return result.rows.map((row: any) => ({
          friend: {
            id: row.friend_id,
            userId1: row.user_id1,
            userId2: row.user_id2,
            request: row.request,
          },
          user: {
            id: row.user_id,
            username: row.username,
            email: row.email,
            profileImage: row.profile_image,
            firstName: row.first_name,
            lastName: row.last_name,
          },
        }));
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error fetching friends: " + error.message);
      } finally {
        client.release();
      }
    },
    friend: async (_: any, { id }: { id: string }, context: any): Promise<{friend: Friend, friendInfo: User}> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const selectFriendsText = `
        SELECT * FROM "friend" 
        WHERE (user_id1 = $1 AND user_id2 = $2) OR (user_id1 = $2 AND user_id2 = $1);
        `;
        const selectFriendsValues = [context.user.id, id];
        const result = await client.query(selectFriendsText, selectFriendsValues);

        const friend: Friend = {
          id: result.rows[0].id,
          userId1: result.rows[0].user_id1,
          userId2: result.rows[0].user_id2,
          request: result.rows[0].request
        }

        const friendDataQueryString = `
        SELECT * FROM "user" 
        WHERE id = $1;
        `

        const friendId = friend.userId1 === context.user.id? [friend.userId2] : [friend.userId1];

        const friendData = await client.query(friendDataQueryString, friendId)

        const friendInfo: User = {
          id: friendData.rows[0].id,
          profileImage: friendData.rows[0].profile_image,
          firstName: friendData.rows[0].first_name,
          lastName: friendData.rows[0].last_name,
          username: friendData.rows[0].username,
        } 

        await client.query("COMMIT");

        return { friend, friendInfo };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    friendRequestsIncoming: async (_: any, args: any, context: any): Promise<Array<{ friend: Friend, user: User }>> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
    
        const selectFriendRequestsIncomingText = `
          WITH incoming_requests AS (
            SELECT
              f.id AS friend_id,
              f.user_id1,
              f.user_id2,
              f.request,
              f.user_id2 AS requester_id
            FROM
              friend f
            WHERE
              f.user_id1 = $1 AND f.request = TRUE
          )
          SELECT
            ir.friend_id,
            ir.user_id1,
            ir.user_id2,
            ir.request,
            u.id AS user_id,
            u.username,
            u.email,
            u.profile_image,
            u.first_name,
            u.last_name
          FROM
            incoming_requests ir
          JOIN
            "user" u ON ir.requester_id = u.id;
        `;
        const selectFriendRequestsIncomingValues = [context.user.id];
        const result = await client.query(selectFriendRequestsIncomingText, selectFriendRequestsIncomingValues);
    
        await client.query("COMMIT");
    
        return result.rows.map((row: any) => ({
          friend: {
            id: row.friend_id,
            userId1: row.user_id1,
            userId2: row.user_id2,
            request: row.request,
          },
          user: {
            id: row.user_id,
            username: row.username,
            email: row.email,
            profileImage: row.profile_image,
            firstName: row.first_name,
            lastName: row.last_name,
          },
        }));
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error fetching incoming friend requests: " + error.message);
      } finally {
        client.release();
      }
    },
    friendRequestsOutgoing: async (_: any, args: any, context: any): Promise<Array<{ friend: Friend, user: User }>> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
    
        const selectFriendRequestsOutgoingText = `
          WITH outgoing_requests AS (
            SELECT
              f.id AS friend_id,
              f.user_id1,
              f.user_id2,
              f.request,
              f.user_id1 AS requester_id
            FROM
              friend f
            WHERE
              f.user_id2 = $1 AND f.request = TRUE
          )
          SELECT
            orq.friend_id,
            orq.user_id1,
            orq.user_id2,
            orq.request,
            u.id AS user_id,
            u.username,
            u.email,
            u.profile_image,
            u.first_name,
            u.last_name
          FROM
            outgoing_requests orq
          JOIN
            "user" u ON orq.requester_id = u.id;
        `;
        const selectFriendRequestsOutgoingValues = [context.user.id];
        const result = await client.query(selectFriendRequestsOutgoingText, selectFriendRequestsOutgoingValues);
    
        await client.query("COMMIT");
    
        return result.rows.map((row: any) => ({
          friend: {
            id: row.friend_id,
            userId1: row.user_id1,
            userId2: row.user_id2,
            request: row.request,
          },
          user: {
            id: row.user_id,
            username: row.username,
            email: row.email,
            profileImage: row.profile_image,
            firstName: row.first_name,
            lastName: row.last_name,
          },
        }));
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error fetching outgoing friend requests: " + error.message);
      } finally {
        client.release();
      }
    },
    search: async (_: any, { searchInput }: { searchInput: string }): Promise<SearchQuery> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
    
        let nameResponse: User | User[] | undefined;
        let usernameResponse: User | User[] | undefined;
        let companyResponse: UserCompany | UserCompany[] | undefined;
    
        const searchInputArr = searchInput.split(" ");
    
        if (searchInputArr.length > 1) {
          const nameQueryString = `SELECT * FROM "user" WHERE first_name = $1 AND last_name = $2`;
          const nameRes = await client.query(nameQueryString, searchInputArr);
          nameResponse = nameRes.rows.map((row: any) => ({
            id: row.id,
            username: row.username,
            email: row.email,
            profileImage: row.profile_image,
            firstName: row.first_name,
            lastName: row.last_name,
          }));
        } else {
          const usernameQueryString = `SELECT * FROM "user" WHERE username = $1`;
          const usernameRes = await client.query(usernameQueryString, [searchInput]);
          usernameResponse = usernameRes.rows.map((row: any) => ({
            id: row.id,
            username: row.username,
            email: row.email,
            profileImage: row.profile_image,
            firstName: row.first_name,
            lastName: row.last_name,
          }));
          
          const companyQueryString = `
            SELECT
              c.*,
              u.id as user_id,
              u.username,
              u.email,
              u.profile_image,
              u.first_name,
              u.last_name
            FROM
              "company" c
            JOIN "user" u
            ON 
              c.user_id = u.id
            WHERE
              c.company_name = $1
          `;
          
          const companyRes = await client.query(companyQueryString, [searchInput]);
          companyResponse = companyRes.rows.map((row: any) => ({
            id: row.id,
            bio: row.bio,
            profileImage: row.profile_image,
            username: row.username,
            firstName: row.first_name,
            lastName: row.last_name,
            companyName: row.company_name,
          }));
        }
    
        await client.query("COMMIT");
    
        return { nameResponse, usernameResponse, companyResponse } as SearchQuery;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
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
          INSERT INTO "user" (profile_image, first_name, last_name, username, email, password)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, profile_image, first_name, last_name, username, email;
        `;

        const insertUserValues = [
          `https://res.cloudinary.com/${process.env.CLOUD_NAME}/image/upload/v1720657512/uifivve2qsnqhbnioqoa.png`,
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
          profileImage: newUser.profile_image,
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

    createCompany: async (_: any, { companyName }: { companyName: string }, context: any): Promise<Company> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
    
        const insertCompanyText = `
          INSERT INTO "company" (company_name, user_id)
          VALUES ($1, $2)
          RETURNING id, company_name, user_id;
        `;
        const insertCompanyValues = [companyName, context.user.id];
        const result = await client.query(insertCompanyText, insertCompanyValues);
    
        const newCompany = result.rows[0];
    
        if (newCompany) {
          const updateUserText = `
            UPDATE "user"
            SET company = $2
            WHERE id = $1
            RETURNING company;
          `;
          const updateUserValues = [context.user.id, true];
          await client.query(updateUserText, updateUserValues);
        }
    
        await client.query("COMMIT");
    
        const company: Company = {
          id: newCompany.id,
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

    createComment: async (_: any, input: Comment, context: any): Promise<Comment> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
    
        const insertCommentText = `
          INSERT INTO "comments" (post_id, user_id, content)
          VALUES ($1, $2, $3)
          RETURNING id, post_id, user_id, content, created_at;
        `;
    
        const insertCommentValues = [input.postId, input.userId, input.content];
        const result = await client.query(insertCommentText, insertCommentValues);
    
        const newComment = result.rows[0];
    
        const selectUserText = 'SELECT * FROM "user" WHERE id = $1';
        const selectUserValues = [context.user.id];
        const userResult = await client.query(selectUserText, selectUserValues);
    
        const userRow = userResult.rows[0];
        await client.query("COMMIT");
    
        const user: User = {
          id: userRow.id,
          profileImage: userRow.profile_image,
          firstName: userRow.first_name,
          lastName: userRow.last_name,
          username: userRow.username,
        };
    
        const comment: Comment = {
          id: newComment.id,
          postId: newComment.post_id,
          userId: newComment.user_id,
          content: newComment.content,
          createdAt: newComment.created_at,
          user
        };
    
        return comment;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error(`Error creating comment: ${error.message}`);
      } finally {
        client.release();
      }
    },
    updateComment: async (_: any, input: Comment): Promise<Comment> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertCommentText = `
          UPDATE "comments"
          SET content = $2
          WHERE id = $1
          RETURNING id, post_id, user_id, content, created_at;
        `;

        const insertCommentValues = [input.id, input.content];

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

    deleteComment: async (_: any, input: Comment): Promise<Comment> => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const insertCommentText = `
          DELETE FROM "comments"
          WHERE id = $1
          RETURNING id, post_id, user_id, content, created_at;
        `;

        const insertCommentValues = [input.id];

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
          RETURNING id, user_id, company_id, code, created_at;
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
        return friend;
      } catch (error: any) {
        await client.query("ROLLBACK");
        throw new Error("Error declining request " + error.message);
      } finally {
        client.release();
      }
    },
    updateUserPfp: async (_: any, { pfp }: { pfp: any }, context: any) => {
      const client = await pool.connect();

      try {

        await client.query("BEGIN");

        const queryString = `
          UPDATE "user"
          SET profile_image = $2
          WHERE id = $1
          RETURNING id, profile_image, first_name, last_name, username;
        `;
        const queryValues = [context.user.id, pfp];

        const queryResult = await client.query(queryString, queryValues);
        await client.query("COMMIT");

        // Construct the User object to return in the GraphQL response
        const user = {
          id: queryResult.rows[0].id,
          profileImage: queryResult.rows[0].profile_image,
          firstName: queryResult.rows[0].first_name,
          lastName: queryResult.rows[0].last_name,
          username: queryResult.rows[0].username,
          email: "", // Add if necessary
          password: "", // Add if necessary
        };

        return user;

      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    updateBio: async (_: any, { bio }: { bio: string }, context: any): Promise<User> => {
      const client = await pool.connect()
      try {
        client.query("BEGIN");

        const queryString = `UPDATE "user"
        SET bio = $1
        WHERE id = $2
        RETURNING id, bio, profile_image, first_name, last_name, username;`
        const queryValues = [bio, context.user.id]
        const result = await client.query(queryString, queryValues);
        client.query("COMMIT");

        const user: User = {
          id: result.rows[0].id,
          bio: result.rows[0].bio,
          profileImage: result.rows[0].profile_image,
          firstName: result.rows[0].first_name,
          lastName: result.rows[0].last_name,
          username: result.rows[0].username
        };
        
        return user;
      } catch(err){
        client.query("ROLLBACK");
        throw err;
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
          profileImage: user.profile_image,
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