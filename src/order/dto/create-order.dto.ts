import { IsArray, IsEmail, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 'Product A' })
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 25.5 })
  @IsNotEmpty()
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'buyer@example.com' })
  @IsEmail()
  buyerEmail: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
