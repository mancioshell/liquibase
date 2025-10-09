import { getAppDataSource } from "@/data-source";
import { PostgreSqlContainer } from "@testcontainers/postgresql";

export const datasource = (async () => {
  const container = await new PostgreSqlContainer(
    "postgres:18-alpine3.21"
  ).start();

  let host = container.getHost();
  let port = container.getPort();
  let username = container.getUsername();
  let password = container.getPassword();
  let database = container.getDatabase();
  return getAppDataSource(host, port, username, password, database, true);
})();
