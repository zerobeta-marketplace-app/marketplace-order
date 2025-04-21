import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    const referenceNumber = `ORD-${Date.now()}`;

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const order = this.orderRepo.create({
      buyerEmail: dto.buyerEmail,
      referenceNumber,
      status: 'pending',
      totalAmount,
      items: dto.items,
    });

    const savedOrder = await this.orderRepo.save(order);

    // Emit Kafka event
  await this.kafka.produce({
    topic: 'order.created',
    messages: [
      {
        value: JSON.stringify({
          id: savedOrder.id,
          referenceNumber: savedOrder.referenceNumber,
          buyerEmail: savedOrder.buyerEmail,
          items: savedOrder.items,
        }),
      },
    ],
  });

  return {
    message: 'Order placed successfully',
    referenceNumber: savedOrder.referenceNumber,
    order: savedOrder,
  };
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

    if (status === 'canceled' && order.status !== 'pending') {
      throw new BadRequestException('Only pending orders can be canceled');
    }
    
    order.status = status;
    await this.orderRepo.save(order);

    // Emit Kafka event
    await this.kafka.produce({
      topic: 'order.status-changed',
      messages: [
        {
          value: JSON.stringify({ orderId, status }),
        },
      ],
    });

    return order;
  }
}
