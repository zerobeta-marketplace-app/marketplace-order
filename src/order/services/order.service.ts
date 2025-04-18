import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { KafkaProducerService } from '../kafka/producer.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    private kafka: KafkaProducerService
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const order = this.orderRepo.create({ buyerEmail: dto.buyerEmail, items: dto.items });
    const savedOrder = await this.orderRepo.save(order);

    // Emit Kafka event
    await this.kafka.produce({
      topic: 'order.created',
      messages: [{ value: JSON.stringify(savedOrder) }]
    });

    return savedOrder;
  }

  async getOrders(email: string, page = 1, limit = 10) {
    const [orders, total] = await this.orderRepo.findAndCount({
      where: { buyerEmail: email },
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return { data: orders, total, page, limit };
  }

  async updateStatus(orderId: number, status: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = status;
    await this.orderRepo.save(order);

    // Emit Kafka event
    await this.kafka.produce({
      topic: 'order.status-changed',
      messages: [{ value: JSON.stringify({ orderId, status }) }]
    });

    return order;
  }
}
