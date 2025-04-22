import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout - Create order from cart' })
  @ApiBody({ type: CreateOrderDto })
  checkout(@Body() dto: CreateOrderDto) {
    return this.service.createOrder(dto);
  }
  

  @Get()
  @ApiOperation({ summary: 'Get orders with pagination' })
  @ApiQuery({ name: 'buyer', required: true, example: 'buyer@example.com' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  getOrders(@Query() query: PaginationDto, @Query('buyer') buyer: string) {
    return this.service.getOrders(buyer, query.page, query.limit);
  }
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.service.updateStatus(+id, dto.status);
  }
}


