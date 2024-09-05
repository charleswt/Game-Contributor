import { Pool } from "pg";
import "dotenv/config";

let pool = new Pool(
  !process.env.PROD?
  {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
  }:
  {
    user: process.env.DB_USER_AWS,
    host: process.env.DB_HOST_AWS,
    database: process.env.DB_NAME_AWS,
    password: process.env.DB_PASSWORD_AWS,
    port: Number(process.env.DB_PORT_AWS),
  });

pool.on("connect", () => {
  console.log("Connected to the database");
});

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export default pool;