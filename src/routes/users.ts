import express, { Request, Response } from "express";

import { User } from "@/entity/users";

export const usersRouter = express.Router();

usersRouter.use(express.json());

usersRouter.get("/", async (req: Request, res: Response) => {
  try {
    const AppDataSource = req.app.get("datasource");
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();

    res.status(200).send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch users");
  }
});

// Example route: http://localhost:8080/users/610aaf458025d42e7ca9fcd0
usersRouter.get("/:id", async (req: Request, res: Response) => {
  const id = req?.params?.id;

  try {
    const AppDataSource = req.app.get("datasource");
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: parseInt(id) });

    if (user) {
      res.status(200).send(user);
    } else {
      res
        .status(404)
        .send(`Unable to find matching document with id: ${req.params.id}`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(`Failed to find user with id: ${req.params.id}`);
  }
});

usersRouter.post("/", async (req: Request, res: Response) => {
  try {
    const AppDataSource = req.app.get("datasource");
    const userRepository = AppDataSource.getRepository(User);

    let user: User = req.body;
    const newUser = userRepository.create(user);
    const result = await userRepository.save(newUser);

    res.status(201).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to create new user",
      error: error.message,
    });
  }
});

usersRouter.put("/:id", async (req: Request, res: Response) => {
  const id = req?.params?.id;

  try {
    const AppDataSource = req.app.get("datasource");
    const userRepository = AppDataSource.getRepository(User);

    let user: User = req.body;
    user.id = parseInt(id);

    const result = await userRepository.update(id, user);

    res
      .status(200)
      .send({ message: "Successfully updated user with id: " + id });
  } catch (error) {
    console.error(error.message);
    res.status(400).send({
      message: "Failed to update user with id: " + req.params.id,
      error: error.message,
    });
  }
});

usersRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = req?.params?.id;

  try {
    const AppDataSource = req.app.get("datasource");
    const userRepository = AppDataSource.getRepository(User);
    const result = await userRepository.delete(id);

    if (result.affected) {
      res
        .status(200)
        .send({ message: "Successfully deleted user with id: " + id });
    } else {
      res
        .status(404)
        .send({
          message: "Unable to find matching document with id: " + req.params.id,
        });
    }
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .send({
        message: "Failed to delete user with id: " + req.params.id,
        error: error.message,
      });
  }
});
