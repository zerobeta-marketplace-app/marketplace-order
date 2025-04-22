import { Injectable } from '@nestjs/common';
import { OrderKafkaConsumerService } from './order/kafka/order-consumer.service';

@Injectable()
export class AppService {
    constructor(private readonly kafkaConsumer: OrderKafkaConsumerService) {
    }
  getHello(): string {
    return 'Hello World!';
  }
}
