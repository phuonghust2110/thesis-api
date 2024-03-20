import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { ChapterEntity } from './chapter.entity';
import { VideoEntity } from './video.entity';

@Entity()
export class CourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  description: string;

  @Column()
  thumnailUrl: string;

  @UpdateDateColumn({ name: 'update_at' })
  update_at: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'create_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_at: Date;
  @ManyToOne(() => UsersEntity, (user) => user.courses)
  @JoinColumn({ name: 'user_id' })
  user?: UsersEntity;
  @OneToMany(() => ChapterEntity, (chapters) => chapters.course)
  chapters?: ChapterEntity[];
  @OneToMany(() => VideoEntity, (videos) => videos.course)
  videos?: VideoEntity[];
}
