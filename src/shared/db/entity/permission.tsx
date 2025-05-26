import {Entity, Column, ManyToMany, JoinTable} from 'typeorm/browser';
import {BaseEntity} from './baseentity';
import {Document} from './document';
import {PatientProfile} from './patientprofile';
import {Consultation} from './consultation';

@Entity('permission')
export class Permission extends BaseEntity {
  @Column({nullable: false})
  userId!: string;
  @Column({nullable: true})
  endDate?: Date;
  @ManyToMany(() => Document, {nullable: true})
  @JoinTable()
  documents?: Document[];
  @ManyToMany(() => PatientProfile, {nullable: true})
  @JoinTable()
  patientProfiles?: PatientProfile[];
  @ManyToMany(() => Consultation, {nullable: true})
  @JoinTable()
  consultations?: Consultation[];
}
