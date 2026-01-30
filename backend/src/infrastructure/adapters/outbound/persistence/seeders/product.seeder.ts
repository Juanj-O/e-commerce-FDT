import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductOrmEntity } from '../typeorm/entities/product.orm-entity';

@Injectable()
export class ProductSeeder {
  private readonly logger = new Logger(ProductSeeder.name);

  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly productRepository: Repository<ProductOrmEntity>,
  ) {}

  async seed() {
    const count = await this.productRepository.count();
    if (count > 0) {
      this.logger.log('Products already seeded, skipping...');
      return;
    }

    const products: Partial<ProductOrmEntity>[] = [
      {
        name: 'iPhone 15 Pro Max',
        description:
          'El iPhone 15 Pro Max cuenta con un diseño de titanio, chip A17 Pro, sistema de cámara Pro de 48MP y el botón de Acción personalizable. Con Dynamic Island y pantalla Super Retina XDR de 6.7 pulgadas.',
        price: 5499000,
        stock: 15,
        imageUrl:
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
      },
      {
        name: 'MacBook Pro 14" M3 Pro',
        description:
          'MacBook Pro con chip M3 Pro, 18GB de memoria unificada, SSD de 512GB y pantalla Liquid Retina XDR de 14.2 pulgadas. Hasta 17 horas de batería.',
        price: 9999000,
        stock: 8,
        imageUrl:
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      },
      {
        name: 'AirPods Pro 2da Gen',
        description:
          'AirPods Pro con cancelación activa de ruido, modo de transparencia adaptativo, audio espacial personalizado y estuche de carga MagSafe con altavoz.',
        price: 1249000,
        stock: 25,
        imageUrl:
          'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800',
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description:
          'Galaxy S24 Ultra con S Pen integrado, cámara de 200MP, pantalla Dynamic AMOLED 2X de 6.8", procesador Snapdragon 8 Gen 3 y Galaxy AI integrado.',
        price: 5999000,
        stock: 12,
        imageUrl:
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
      },
      {
        name: 'PlayStation 5 Slim',
        description:
          'Consola PlayStation 5 versión Slim con SSD de 1TB, DualSense, salida 4K HDR a 120fps y acceso a los mejores juegos exclusivos de PlayStation.',
        price: 2499000,
        stock: 10,
        imageUrl:
          'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
      },
      {
        name: 'Apple Watch Series 9',
        description:
          'Apple Watch Series 9 con chip S9, doble toque, pantalla Retina siempre activa, sensor de oxígeno en sangre y ECG. Resistente al agua hasta 50m.',
        price: 2199000,
        stock: 20,
        imageUrl:
          'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
      },
    ];

    await this.productRepository.save(products);
    this.logger.log(`Seeded ${products.length} products successfully`);
  }
}
