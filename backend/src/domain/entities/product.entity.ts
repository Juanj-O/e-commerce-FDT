export interface ProductProps {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _description: string;
  private readonly _price: number;
  private _stock: number;
  private readonly _imageUrl?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ProductProps) {
    this._id = props.id || '';
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._stock = props.stock;
    this._imageUrl = props.imageUrl;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get price(): number {
    return this._price;
  }

  get stock(): number {
    return this._stock;
  }

  get imageUrl(): string | undefined {
    return this._imageUrl;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  hasStock(quantity: number): boolean {
    return this._stock >= quantity;
  }

  decreaseStock(quantity: number): void {
    if (!this.hasStock(quantity)) {
      throw new Error('Insufficient stock');
    }
    this._stock -= quantity;
    this._updatedAt = new Date();
  }

  increaseStock(quantity: number): void {
    this._stock += quantity;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      price: this._price,
      stock: this._stock,
      imageUrl: this._imageUrl,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
