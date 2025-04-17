import {Entity, Column} from 'typeorm/browser';
import {BaseEntity} from './baseentity';

@Entity('document')
export class Document extends BaseEntity {
  @Column({nullable: false})
  name!: string;
}
