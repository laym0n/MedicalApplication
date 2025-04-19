import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm/browser';

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({name: 'created_at'})
  createdAt!: string;

  @VersionColumn({name: 'version'})
  version!: number;

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt!: string;

  @DeleteDateColumn({name: 'deleted_at', nullable: true})
  deletedAt?: string;
}
