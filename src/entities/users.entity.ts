import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeviceSessionEntity } from './devicesession.entity';
import { VideoEntity } from './video.entity';
import { DocumentEntity } from './document.entity';
import { CourseEntity } from './course.entity';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column()
  lastName: string;

  @UpdateDateColumn({ name: 'update_at' })
  update_at: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'create_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_at: Date;

  @OneToMany(() => DeviceSessionEntity, (deviceSessions) => deviceSessions.user)
  deviceSessions: DeviceSessionEntity[];

  @OneToMany(() => DocumentEntity, (documents) => documents.user)
  documents?: VideoEntity[];

  @OneToMany(() => CourseEntity, (courses) => courses.user)
  courses?: CourseEntity[];
}
