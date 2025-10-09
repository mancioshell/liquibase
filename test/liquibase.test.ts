import fs from "fs";
import path from "path";

import {
  describe,
  expect,
  inject,
  test,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";
import { LiquibaseConfig, Liquibase } from "liquibase";

import { getAppDataSource } from "@/data-source";
import { User } from "@/entity/users";
import { DataSource } from "typeorm";
import { Person } from "@/entity/person";

describe("Liquibase", () => {
  let devDataSource: DataSource;
  let qaDataSource: DataSource;
  let prodDataSource: DataSource;

  let baselineInstance: Liquibase;
  let updateInstance: Liquibase;
  let rollbackInstance: Liquibase;
  let manualRollbackInstance: Liquibase;

  beforeAll(async () => {
    const directory = "./changelogs";

    if (fs.existsSync(directory)) {
      for (const file of await fs.promises.readdir(directory)) {
        if (file.endsWith(".xml")) {
          await fs.promises.unlink(path.join(directory, file));
        }
      }
    }

    const prodConfig = inject("prodConfig");
    const qaConfig = inject("qaConfig");
    const devConfig = inject("devConfig");
    const localConfig = inject("localConfig");

    let baselineLiquibaseConfig: LiquibaseConfig = {
      changeLogFile: "./changelogs/changelog.xml",
      url: `jdbc:postgresql://${devConfig?.host}:${devConfig?.port}/${devConfig?.database}`,
      username: devConfig.username,
      password: devConfig.password,
    };
    baselineInstance = new Liquibase(baselineLiquibaseConfig);

    let updateLiquibaseConfig: LiquibaseConfig = {
      changeLogFile: "./changelogs/changelog-diff.xml",
      url: `jdbc:postgresql://${devConfig?.host}:${devConfig?.port}/${devConfig?.database}`,
      username: devConfig.username,
      password: devConfig.password,
      referenceUrl: `jdbc:postgresql://${localConfig?.host}:${localConfig?.port}/${localConfig?.database}`,
      referenceUsername: localConfig?.username,
      referencePassword: localConfig?.password,
    };

    updateInstance = new Liquibase(updateLiquibaseConfig);

    let rollbackLiquibaseConfig: LiquibaseConfig = {
      changeLogFile: "./changelogs/changelog-diff.xml",
      url: `jdbc:postgresql://${qaConfig?.host}:${qaConfig?.port}/${qaConfig?.database}`,
      username: qaConfig?.username,
      password: qaConfig?.password,
      referenceUrl: `jdbc:postgresql://${localConfig?.host}:${localConfig?.port}/${localConfig?.database}`,
      referenceUsername: localConfig?.username,
      referencePassword: localConfig?.password,
    };

    rollbackInstance = new Liquibase(rollbackLiquibaseConfig);

    let manualRollbackLiquibaseConfig: LiquibaseConfig = {
      changeLogFile: "./rollbacks/changelog-diff.xml",
      url: `jdbc:postgresql://${prodConfig?.host}:${prodConfig?.port}/${prodConfig?.database}`,
      username: prodConfig?.username,
      password: prodConfig?.password,
      referenceUrl: `jdbc:postgresql://${localConfig?.host}:${localConfig?.port}/${localConfig?.database}`,
      referenceUsername: localConfig?.username,
      referencePassword: localConfig?.password,
    };

    manualRollbackInstance = new Liquibase(manualRollbackLiquibaseConfig);

    await getAppDataSource(
      localConfig?.host as string,
      localConfig?.port as number,
      localConfig?.username as string,
      localConfig?.password as string,
      localConfig?.database as string,
      true
    ).initialize();

    devDataSource = await getAppDataSource(
      devConfig?.host as string,
      devConfig?.port as number,
      devConfig?.username as string,
      devConfig?.password as string,
      devConfig?.database as string,
      false
    );

    qaDataSource = await getAppDataSource(
      qaConfig?.host as string,
      qaConfig?.port as number,
      qaConfig?.username as string,
      qaConfig?.password as string,
      qaConfig?.database as string,
      false
    );

    prodDataSource = await getAppDataSource(
      prodConfig?.host as string,
      prodConfig?.port as number,
      prodConfig?.username as string,
      prodConfig?.password as string,
      prodConfig?.database as string,
      false
    );
  });

  afterAll(async () => {
    //await datasource.destroy();
  });

  test("should generate changelog baseline", async () => {
    await baselineInstance.generateChangeLog({
      includeSchema: true,
      includeTablespace: true,
      overwriteOutputFile: true,
    });
  });

  test("should generate changelog diff from local and development database environments", async () => {
    await updateInstance.diffChangelog({});
  });

  test("should apply changelog diff to development database", async () => {
    let user = {
      name: "Test",
      surname: "User",
      age: 30,
      email: "test.user@example.com",
      address: "123 Test St, Test City",
    };

    let dataSource = await devDataSource.initialize();
    let repository = dataSource.getRepository(User);

    const newUser = repository.create(user);
    await expect(repository.save(newUser)).rejects.toThrowError();

    await updateInstance.update({});
    await dataSource.destroy();

    dataSource = await devDataSource.initialize();
    repository = dataSource.getRepository(User);

    await repository.save(newUser);
    let users = await repository.find();

    expect(users.length).toBe(1);
  });

  test("should not rollback ModifyDataTypeChange changelog diff automatically", async () => {
    let person = {
      name: "Test",
      surname: "User",
      age: "30",
      gender: "Non-binary",
    };

    await rollbackInstance.tag({ tag: "v1" });
    await rollbackInstance.update({});

    let dataSource = await qaDataSource.initialize();
    let repository = dataSource.getRepository(Person);

    const newPerson = repository.create(person);

    await repository.save(newPerson);
    let people = await repository.find();

    expect(people.length).toBe(1);

    await expect(
      rollbackInstance.rollback({ tag: "v1" })
    ).rejects.toThrowError();
  });

  test("should rollback ModifyDataTypeChange changelog diff with explicit rollback instruction", async () => {
    let person = {
      name: "Test",
      surname: "User",
      age: "30",
      gender: "Non-binary",
    };

    await manualRollbackInstance.tag({ tag: "v1" });
    await manualRollbackInstance.update({});

    let dataSource = await prodDataSource.initialize();
    let repository = dataSource.getRepository(Person);

    const newPerson = repository.create(person);

    await repository.save(newPerson);
    let people = await repository.find();

    expect(people.length).toBe(1);

    await manualRollbackInstance.rollback({ tag: "v1" });
    await dataSource.destroy();

    dataSource = await prodDataSource.initialize();
    repository = dataSource.getRepository(Person);
    people = await repository.find();

    expect(people.length).toBe(1);
  });
});
