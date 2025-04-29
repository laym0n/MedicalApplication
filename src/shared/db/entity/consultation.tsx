import {Entity, Column} from 'typeorm/browser';
import {BaseEntity} from './baseentity';

@Entity('consultation')
export class Consultation extends BaseEntity {
  @Column({nullable: false})
  transactionId!: string;
  @Column({nullable: false})
  consultationId!: string;
}
