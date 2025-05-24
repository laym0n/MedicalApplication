import {Entity, Column, BeforeInsert, BeforeUpdate} from 'typeorm/browser';
import {BaseEntity} from './baseentity';
import {encryptWithKey, decryptWithKey} from '@shared/util/crypto-util';

@Entity('patient_profile')
export class PatientProfile extends BaseEntity {
  encryptionKey!: string;

  @Column({nullable: false, name: 'name'})
  name!: string;

  @Column({nullable: true, name: 'gender'})
  gender: string | undefined;

  @Column({nullable: true, name: 'birth_date'})
  birthDate: string | undefined;

  @Column({nullable: true, name: 'social_status'})
  socialStatus: string | undefined;

  @Column({nullable: true, name: 'disability_group'})
  disabilityGroup: string | undefined;

  @Column({nullable: true, name: 'chronic_conditions'})
  chronicConditions: string | undefined;

  @Column({nullable: true, name: 'medications'})
  medications: string | undefined;

  @Column({nullable: true, name: 'allergies'})
  allergies: string | undefined;

  @Column({nullable: true, name: 'lifestyle_notes'})
  lifestyleNotes: string | undefined;

  @BeforeInsert()
  @BeforeUpdate()
  encryptAllFields() {
    this.gender = this.gender
      ? encryptWithKey(this.gender, this.encryptionKey)
      : undefined;
    this.birthDate = this.birthDate
      ? encryptWithKey(this.birthDate, this.encryptionKey)
      : undefined;
    this.socialStatus = this.socialStatus
      ? encryptWithKey(this.socialStatus, this.encryptionKey)
      : undefined;
    this.disabilityGroup = this.disabilityGroup
      ? encryptWithKey(this.disabilityGroup, this.encryptionKey)
      : undefined;
    this.chronicConditions = this.chronicConditions
      ? encryptWithKey(this.chronicConditions, this.encryptionKey)
      : undefined;
    this.medications = this.medications
      ? encryptWithKey(this.medications, this.encryptionKey)
      : undefined;
    this.allergies = this.allergies
      ? encryptWithKey(this.allergies, this.encryptionKey)
      : undefined;
    this.lifestyleNotes = this.lifestyleNotes
      ? encryptWithKey(this.lifestyleNotes, this.encryptionKey)
      : undefined;
  }

  decryptAllFields() {
    this.gender = this.gender
      ? decryptWithKey(this.gender, this.encryptionKey)
      : undefined;
    this.birthDate = this.birthDate
      ? decryptWithKey(this.birthDate, this.encryptionKey)
      : undefined;
    this.socialStatus = this.socialStatus
      ? decryptWithKey(this.socialStatus, this.encryptionKey)
      : undefined;
    this.disabilityGroup = this.disabilityGroup
      ? decryptWithKey(this.disabilityGroup, this.encryptionKey)
      : undefined;
    this.chronicConditions = this.chronicConditions
      ? decryptWithKey(this.chronicConditions, this.encryptionKey)
      : undefined;
    this.medications = this.medications
      ? decryptWithKey(this.medications, this.encryptionKey)
      : undefined;
    this.allergies = this.allergies
      ? decryptWithKey(this.allergies, this.encryptionKey)
      : undefined;
    this.lifestyleNotes = this.lifestyleNotes
      ? decryptWithKey(this.lifestyleNotes, this.encryptionKey)
      : undefined;
  }
}
