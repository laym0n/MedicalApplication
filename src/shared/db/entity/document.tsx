import {Entity, Column} from 'typeorm/browser';
import {BaseEntity} from './baseentity';

@Entity('document')
export class Document extends BaseEntity {
  @Column({nullable: false})
  name!: string;
  @Column({nullable: false})
  fileId!: string;
  @Column({nullable: false})
  fileUri!: string;
  @Column({nullable: false})
  mime!: string;
}
