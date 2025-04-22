import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderKafkaConsumerService } from './order/kafka/order-consumer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './order/order.module';
import { redisStore } from 'cache-manager-redis-store';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'beta_marketplace',
      signOptions: { expiresIn: '1h' },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'redis',
            port: 6379,
          },
          ttl: 30 * 60, // 30 minutes
        }),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'beta_marketplace',
      synchronize: true,
      autoLoadEntities: true,
    }),
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
 
})
export class AppModule {}
