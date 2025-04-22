import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { KafkaProducerService } from './kafka/producer.service';
import { OrderKafkaConsumerService } from './kafka/order-consumer.service';

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderItem])],
    controllers: [OrderController],
    providers: [OrderService, KafkaProducerService, OrderKafkaConsumerService],
  })
  export class OrderModule {}
  