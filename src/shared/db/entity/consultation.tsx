import {Entity, Column, BeforeInsert, BeforeUpdate} from 'typeorm/browser';
import {BaseEntity} from './baseentity';
import {encryptWithKey, decryptWithKey} from '@shared/util/crypto-util';
import {IBackUpable} from './backupable';

@Entity('consultation')
export class Consultation extends BaseEntity implements IBackUpable {
  encryptionKey!: string;

  @Column({nullable: true})
  transactionId!: string;

  @Column({nullable: false})
  data!: string;
  @Column({nullable: false})
  consultationId!: string;
  @Column({nullable: false})
  specialization!: string;
  @Column({nullable: false})
  userId!: string;
  @Column({nullable: true})
  doctorName: string | undefined;

  @BeforeInsert()
  @BeforeUpdate()
  encryptField() {
    this.data = encryptWithKey(this.data, this.encryptionKey);
    this.consultationId = encryptWithKey(
      this.consultationId,
      this.encryptionKey,
    );
    this.userId = encryptWithKey(this.userId, this.encryptionKey);
    if (this.doctorName) {
      this.doctorName = encryptWithKey(this.doctorName, this.encryptionKey);
    }
  }

  decryptFields() {
    this.data = decryptWithKey(this.data, this.encryptionKey);
    this.consultationId = decryptWithKey(
      this.consultationId,
      this.encryptionKey,
    );
    this.userId = decryptWithKey(this.userId, this.encryptionKey);
    if (this.doctorName) {
      this.doctorName = decryptWithKey(this.doctorName, this.encryptionKey);
    }
  }
}
