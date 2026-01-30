export interface CustomerProps {
  id?: string;
  email: string;
  fullName: string;
  phone?: string;
  createdAt?: Date;
}

export class Customer {
  private readonly _id: string;
  private readonly _email: string;
  private readonly _fullName: string;
  private readonly _phone?: string;
  private readonly _createdAt: Date;

  constructor(props: CustomerProps) {
    this._id = props.id || '';
    this._email = props.email;
    this._fullName = props.fullName;
    this._phone = props.phone;
    this._createdAt = props.createdAt || new Date();
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get fullName(): string {
    return this._fullName;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  toJSON() {
    return {
      id: this._id,
      email: this._email,
      fullName: this._fullName,
      phone: this._phone,
      createdAt: this._createdAt,
    };
  }
}
