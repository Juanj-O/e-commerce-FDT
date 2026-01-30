import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CreateTransactionDto } from '../../../application/dtos/create-transaction.dto';
import { GetTransactionUseCase } from '../../../application/use-cases/transactions/get-transaction.use-case';
import { ProcessPaymentUseCase } from '../../../application/use-cases/transactions/process-payment.use-case';
import {
    InsufficientStockException,
    ProductNotFoundException,
} from '../../../domain/exceptions/domain.exception';

@ApiTags('Transactions')
@Controller('api/transactions')
export class TransactionsController {
  constructor(
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction and process payment' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Transaction created and payment processed',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or payment failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    
    const result = await this.processPaymentUseCase.execute(createTransactionDto);

    if (result.isFailure) {
      const error = result.error;

      if (error instanceof ProductNotFoundException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof InsufficientStockException) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException(error.message);
    }

    const { transaction, customer, delivery } = result.value;

    return {
      success: true,
      data: {
        transaction: transaction.toJSON(),
        customer: customer.toJSON(),
        delivery: delivery.toJSON(),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a transaction by ID', 
    description: 'Returns transaction details. If status is PENDING, automatically checks with Business and updates if status changed.' 
  })
  @ApiParam({ name: 'id', description: 'Transaction UUID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction found. If was PENDING, status is refreshed from Business.',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
  })
  async findOne(@Param('id') id: string) {

    const result = await this.getTransactionUseCase.execute(id);

    if (result.isFailure) {
      throw new NotFoundException(result.error.message);
    }

    return {
      success: true,
      data: result.value.toJSON(),
    };
  }
}
