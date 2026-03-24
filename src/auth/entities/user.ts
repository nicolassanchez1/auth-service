import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @ApiProperty({
    example: 'b8b1e9c-c5a7-48b0-8b9d-a7241acc0518',
    description: 'User ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Nico',
    description: 'User name',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'nico@test.com',
    description: 'User email',
    uniqueItems: true,
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: '******',
    description: 'User password',
  })
  @Column()
  passwordHash: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
