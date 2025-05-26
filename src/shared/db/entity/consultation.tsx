import {
  Entity,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm/browser';
import {BaseEntity} from './baseentity';
import {encryptWithKey, decryptWithKey} from '@shared/util/crypto-util';

@Entity('consultation')
export class Consultation extends BaseEntity {
  encryptionKey!: string;

  @Column({nullable: true})
  transactionId!: string;

  @Column({ nullable: false })
  data!: string;
  @Column({ nullable: false })
  consultationId!: string;

  @BeforeInsert()
  @BeforeUpdate()
  encryptField() {
    this.data = encryptWithKey(this.data, this.encryptionKey);
    this.consultationId = encryptWithKey(this.consultationId, this.encryptionKey);
  }

  decryptFields() {
    this.data = decryptWithKey(this.data, this.encryptionKey);
    this.consultationId = decryptWithKey(this.consultationId, this.encryptionKey);
  }
}
