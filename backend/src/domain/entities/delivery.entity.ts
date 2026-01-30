export interface DeliveryProps {
  id?: string;
  customerId: string;
  address: string;
  city: string;
  department: string;
  zipCode?: string;
  createdAt?: Date;
}

export class Delivery {
  private readonly _id: string;
  private readonly _customerId: string;
  private readonly _address: string;
  private readonly _city: string;
  private readonly _department: string;
  private readonly _zipCode?: string;
  private readonly _createdAt: Date;

  constructor(props: DeliveryProps) {
    this._id = props.id || '';
    this._customerId = props.customerId;
    this._address = props.address;
    this._city = props.city;
    this._department = props.department;
    this._zipCode = props.zipCode;
    this._createdAt = props.createdAt || new Date();
  }

  get id(): string {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get address(): string {
    return this._address;
  }

  get city(): string {
    return this._city;
  }

  get department(): string {
    return this._department;
  }

  get zipCode(): string | undefined {
    return this._zipCode;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get fullAddress(): string {
    return `${this._address}, ${this._city}, ${this._department}${this._zipCode ? ` - ${this._zipCode}` : ''}`;
  }

  toJSON() {
    return {
      id: this._id,
      customerId: this._customerId,
      address: this._address,
      city: this._city,
      department: this._department,
      zipCode: this._zipCode,
      createdAt: this._createdAt,
    };
  }
}
