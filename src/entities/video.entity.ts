import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChapterEntity } from './chapter.entity';

@Entity()
export class VideoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: false })
  title: string;
  @Column()
  fileName: string;
  @Column()
  fileId: string;
  @Column()
  urlFile: string;
  @Column({
    type: 'timestamp with time zone',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ChapterEntity, (chapter) => chapter.videos)
  @JoinColumn({ name: 'chapter_id' })
  chapter?: ChapterEntity;
}
