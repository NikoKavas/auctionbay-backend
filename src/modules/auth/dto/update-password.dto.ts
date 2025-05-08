import { IsNotEmpty, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  @Matches(
    /^(?=.*\d)(?=.*[A-Za-z]).{6,}$/,
    { message: 'Password must be at least 6 characters long and contain letters and numbers' },
  )
  newPassword: string;

  @IsNotEmpty()
  confirmPassword: string;
}