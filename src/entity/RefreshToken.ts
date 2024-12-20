import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './User'

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'timestamp' })
  expiresAt: Date

  // Many refresh token can be created for one user as users can login to different devices
  @ManyToOne(() => User)
  user: User

  @UpdateDateColumn()
  updatedAt: number

  @CreateDateColumn()
  createdAt: number
}
