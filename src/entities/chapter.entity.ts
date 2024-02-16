import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseEntity } from './course.entity';
import { VideoEntity } from './video.entity';

@Entity('chapter')
export class ChapterEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  chapterName: string;

  @UpdateDateColumn({ name: 'update_at' })
  update_at: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'create_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_at: Date;

  @ManyToOne(() => CourseEntity, (course) => course.chapters)
  @JoinColumn({ name: 'course_id' })
  course?: CourseEntity;

  @OneToMany(() => VideoEntity, (videos) => videos.chapter)
  videos?: VideoEntity[];
}
