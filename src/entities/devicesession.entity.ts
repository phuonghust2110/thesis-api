import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity('device_session')
export class DeviceSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  refreshToken: string;

  @Column()
  ipAddress: string;

  @Column()
  secretKey: string;

  @Column({ unique: true })
  deviceId: string;

  @Column({ name: 'expired_at' })
  expired_at: Date;

  @Column()
  ua: string;

  @Column({
    name: 'create_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_at: Date;

  @UpdateDateColumn({ name: 'update_at' })
  update_at: Date;

  @ManyToOne(() => UsersEntity, (user) => user.deviceSessions)
  @JoinColumn({ name: 'user_id' })
  user?: UsersEntity;
}
