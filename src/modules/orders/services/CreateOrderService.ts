import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO

    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('User does not exists');
    }

    const productsIds = products.map(product => {
      return { id: product.id };
    });

    const productsFound = await this.productsRepository.findAllById(
      productsIds,
    );

    if (productsFound.length !== products.length) {
      throw new AppError('One or more products is invalid');
    }

    const productsParsed = productsFound.map(prod => {
      const productToCompareIndex = products.findIndex(p => p.id === prod.id);

      if (Number(prod.quantity) < products[productToCompareIndex].quantity) {
        throw new AppError('One or more products do not have enough quantity');
      }

      return {
        product_id: prod.id,
        price: prod.price,
        quantity: products[productToCompareIndex].quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: productsParsed,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
