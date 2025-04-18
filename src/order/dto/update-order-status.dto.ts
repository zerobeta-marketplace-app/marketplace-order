import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsIn(['pending', 'completed', 'cancelled'])
  status: string;
}
