import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
    name: "firstName",
  })
  name: string;

  @Column({
    length: 100,
    name: "lastName",
  })
  surname: string;

  @Column("int")
  age: number;

  @Column("text")
  email: string;

  @Column("text")
  address: string;
}
