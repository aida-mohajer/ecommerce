import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;

    @ApiProperty({ example: 'John' })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    first_name: string;

    @ApiProperty({ example: 'Klark' })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    last_name: string;

    @ApiProperty({ example: '09036839014' })
    @IsNotEmpty()
    @IsString()
    @Length(11, 11, { message: 'Phone number must be exactly 11 digits' })
    @Matches(/^\d+$/, { message: 'Phone must contain numbers only' })
    phone: string;
}