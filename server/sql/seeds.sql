\c GC

INSERT INTO "user" (company, profile_image, first_name, last_name, username, email, password)
VALUES
(FALSE, 'profile1.jpg', 'John', 'Doe', 'johndoe', 'john@example.com', 'password123'),
(FALSE, 'profile2.jpg', 'Jane', 'Smith', 'janesmith', 'jane@example.com', 'password123'),
(FALSE, 'profile3.jpg', 'Company', 'One', 'companyone', 'companyone@example.com', 'password123');

-- INSERT INTO posts (user_id, content)
-- VALUES
-- (1, "This is John's first post."),
-- (2, "This is Jane's first post.");

-- INSERT INTO comments (post_id, user_id, content)
-- VALUES
-- (1, 2, 'Great post, John!'),
-- (2, 1, 'Thanks, Jane!');

-- INSERT INTO published_code (user_id, company_user_id, code)
-- VALUES
-- (1, 3, 'print("Hello World")'),
-- (2, 3, 'console.log("Hello World")');

-- INSERT INTO friend (user_id1, user_id2, request)
-- VALUES
-- (1, 2, FALSE),
-- (1, 3, TRUE);