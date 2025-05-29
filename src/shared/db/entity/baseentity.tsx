import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm/browser';

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({name: 'created_at'})
  createdAt!: Date;

  @VersionColumn({name: 'version'})
  version!: number;

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt!: Date;

  @DeleteDateColumn({name: 'deleted_at', nullable: true})
  deletedAt?: Date;
}
