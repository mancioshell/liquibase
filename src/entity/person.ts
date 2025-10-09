import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class Person extends BaseEntity {
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

  @Column("text")
  age: string;

  @Column("text")
  gender: string;
}
