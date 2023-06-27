import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("coinInfo")
export class CoinInfo {
  @PrimaryGeneratedColumn({ type: "int4" })
  id!: number;

  @Column({ type: "varchar", length: 100 })
  address!: string;

  @Column({ type: "int4" })
  decimals!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255 })
  symbol!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ type: "varchar", name: "iconUrl", length: 255, nullable: true })
  iconUrl!: string;

  @Column({ type: "boolean" })
  verified!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
