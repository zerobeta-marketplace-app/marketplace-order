import { Injectable } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderKafkaConsumerService implements OnModuleInit {
  private kafka = new Kafka({ brokers: ['kafka:29092'] });
  private consumer: Consumer = this.kafka.consumer({ groupId: 'order-group' });

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>
  ) {}

  async onModuleInit() {
    console.log("calling scheduler consumer client")
    await this.consumer.connect();
    
    console.log('Kafka consumer connected.');
    await this.consumer.subscribe({ topic: 'order.mark-completed' });
    console.log('Subscribed to topic: order.mark-completed');
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) {
          console.error(' Kafka message value is null');
          return;
        }
        const payload = JSON.parse(message.value.toString());
        console.log(` Kafka message received on ${topic}:`, payload);

        if (payload.action === 'mark-completed') {
          const pendingOrders = await this.orderRepo.find({ where: { status: 'pending' } });

          for (const order of pendingOrders) {
            order.status = 'completed';
            await this.orderRepo.save(order);
            console.log(` Order #${order.id} marked as completed`);
          }
        }
      },
    });
  }
}
