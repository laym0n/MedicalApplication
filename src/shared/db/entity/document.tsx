import {Entity, Column} from 'typeorm/browser';
import {BaseEntity} from './baseentity';
import { IBackUpable, IFileBackUpable } from './backupable';

@Entity('document')
export class Document extends BaseEntity implements IBackUpable, IFileBackUpable {
  @Column({nullable: false})
  name!: string;
  @Column({nullable: false})
  fileId!: string;
  @Column({nullable: false})
  fileUri!: string;
  @Column({nullable: false})
  mime!: string;
  @Column({nullable: true})
  transactionId!: string;
  @Column({nullable: true})
  cidId!: string;
}
