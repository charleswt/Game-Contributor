import pool from '../config/connect';

async function insertData() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert users and return their IDs
    const userInsertQuery = `
      INSERT INTO "user" (company, profile_image, first_name, last_name, username, email, password)
      VALUES
      (FALSE, 'https://res.cloudinary.com/dtmr1se3m/image/upload/v1720657512/uifivve2qsnqhbnioqoa.png', 'John', 'Doe', 'johndoe', 'john@example.com', 'password123'),
      (FALSE, 'https://res.cloudinary.com/dtmr1se3m/image/upload/v1720657512/uifivve2qsnqhbnioqoa.png', 'Jane', 'Smith', 'janesmith', 'jane@example.com', 'password123'),
      (TRUE, 'https://res.cloudinary.com/dtmr1se3m/image/upload/v1720657512/uifivve2qsnqhbnioqoa.png', 'Company', 'One', 'companyone', 'companyone@example.com', 'password123')
      RETURNING id;
    `;
    
    const userResult = await client.query(userInsertQuery);
    const userIds = userResult.rows.map(row => row.id);

    // Insert company
    const companyInsertQuery = `
      INSERT INTO company (company_name, user_id)
      VALUES
      ('Company One', $1)
      RETURNING id;
    `;
    const companyResult = await client.query(companyInsertQuery, [userIds[2]]);
    const companyId = companyResult.rows[0].id;

    // Insert posts
    const postInsertQuery = `
      INSERT INTO posts (user_id, content)
      VALUES
      ($1, 'This is Johns first post.'),
      ($2, 'This is Janes first post.')
      RETURNING id;
    `;
    const postResult = await client.query(postInsertQuery, [userIds[0], userIds[1]]);
    const postIds = postResult.rows.map(row => row.id);

    // Insert comments
    const commentInsertQuery = `
      INSERT INTO comments (post_id, user_id, content)
      VALUES
      ($1, $2, 'Great post, John!'),
      ($1, $3, 'Thanks, Jane!');
    `;
    await client.query(commentInsertQuery, [postIds[0], userIds[1], userIds[0]]);

    // Insert published code
    const codeInsertQuery = `
      INSERT INTO published_code (user_id, company_id, code)
      VALUES
      ($1, $3, 'print("Hello World")'),
      ($2, $3, 'console.log("Hello World")');
    `;
    await client.query(codeInsertQuery, [userIds[0], userIds[1], companyId]);

    // Insert friends
    const friendInsertQuery = `
      INSERT INTO friend (user_id1, user_id2, request)
      VALUES
      ($1, $2, FALSE),
      ($1, $3, TRUE);
    `;
    await client.query(friendInsertQuery, [userIds[0], userIds[1], userIds[2]]);

    await client.query("COMMIT");

    console.log('Data inserted successfully');
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

insertData();