import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AnswerEntity } from './answer.entity';

@Entity('question')
export class QuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  question: string;
  @UpdateDateColumn({ name: 'update_at' })
  update_at: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'create_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_at: Date;

  @OneToMany(() => AnswerEntity, (answers) => answers.question)
  answers?: AnswerEntity[];
}
