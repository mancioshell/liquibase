import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "@/entity/users";
import { Person } from "./entity/person";

export const getAppDataSource = (
  host: string,
  port: number,
  username: string,
  password: string,
  database: string,
  synchronize: boolean
) => {
  const datasource = new DataSource({
    type: "postgres",
    host,
    port,
    username,
    password,
    database,
    synchronize,
    logging: true,
    entities: [User, Person],
    subscribers: [],
    migrations: [],
    //"src/migrations/*.ts"
    // ],
  });

  return datasource;
};
