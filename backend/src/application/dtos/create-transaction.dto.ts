import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CardDataDto {
  @ApiProperty({ example: '4242424242424242' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @IsNotEmpty()
  cvc: string;

  @ApiProperty({ example: '12' })
  @IsString()
  @IsNotEmpty()
  expMonth: string;

  @ApiProperty({ example: '28' })
  @IsString()
  @IsNotEmpty()
  expYear: string;

  @ApiProperty({ example: 'JOHN DOE' })
  @IsString()
  @IsNotEmpty()
  cardHolder: string;
}

export class CustomerDataDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ example: '+573001234567' })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class DeliveryDataDto {
  @ApiProperty({ example: 'Calle 123 #45-67' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Cundinamarca' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiPropertyOptional({ example: '110111' })
  @IsString()
  @IsOptional()
  zipCode?: string;
}

export class CreateTransactionDto {
  @ApiProperty({ example: 'uuid-product-id' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @ApiProperty({ type: CustomerDataDto })
  @ValidateNested()
  @Type(() => CustomerDataDto)
  customer: CustomerDataDto;

  @ApiProperty({ type: DeliveryDataDto })
  @ValidateNested()
  @Type(() => DeliveryDataDto)
  delivery: DeliveryDataDto;

  @ApiProperty({ type: CardDataDto })
  @ValidateNested()
  @Type(() => CardDataDto)
  card: CardDataDto;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  installments?: number;
}
