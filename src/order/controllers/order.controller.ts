import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('orders')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout - Create order from cart' })
  checkout(@Body() dto: CreateOrderDto) {
    return this.service.createOrder(dto);
  }
  

  @Get()
  getOrders(@Query() query: PaginationDto, @Query('buyer') buyer: string) {
    return this.service.getOrders(buyer, query.page, query.limit);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.service.updateStatus(+id, dto.status);
  }
}


