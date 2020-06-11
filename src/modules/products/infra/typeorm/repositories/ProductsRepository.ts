import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    // TODO
    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    // TODO
    const findProduct = await this.ormRepository.findOne({ where: { name } });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // TODO
    const allProducts = await this.ormRepository.findByIds(products);

    return allProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // TODO
    const productIds = products.map(prod => prod.id);

    const productsFound = await this.ormRepository.find({
      where: { id: In(productIds) },
    });

    products.map(prod => {
      const prodIndex = productsFound.findIndex(p => p.id === prod.id);
      productsFound[prodIndex].quantity -= prod.quantity;

      return productsFound;
    });

    await this.ormRepository.save(productsFound);

    return productsFound;
  }
}

export default ProductsRepository;
