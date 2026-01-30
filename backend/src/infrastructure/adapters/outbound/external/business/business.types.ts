export interface BusinessTokenizeCardRequest {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

export interface BusinessTokenResponse {
  status: string;
  data: {
    id: string;
    created_at: string;
    brand: string;
    name: string;
    last_four: string;
    bin: string;
    exp_year: string;
    exp_month: string;
    card_holder: string;
    expires_at: string;
  };
}

export interface BusinessAcceptanceTokenResponse {
  data: {
    presigned_acceptance: {
      acceptance_token: string;
      permalink: string;
      type: string;
    };
  };
}

export interface BusinessCreateTransactionRequest {
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  reference: string;
  signature: string;
  acceptance_token: string;
  payment_method: {
    type: string;
    token: string;
    installments: number;
  };
  customer_data?: {
    full_name: string;
    phone_number?: string;
  };
}

export interface BusinessTransactionResponse {
  data: {
    id: string;
    created_at: string;
    finalized_at: string;
    amount_in_cents: number;
    reference: string;
    customer_email: string;
    currency: string;
    payment_method_type: string;
    payment_method: {
      type: string;
      extra: {
        bin: string;
        name: string;
        brand: string;
        exp_year: string;
        card_type: string;
        exp_month: string;
        last_four: string;
        card_holder: string;
        is_three_ds: boolean;
        three_ds_auth_type: string;
      };
      installments: number;
    };
    status: string;
    status_message: string;
    billing_data: null;
    shipping_address: null;
    redirect_url: null;
    payment_source_id: null;
    payment_link_id: null;
    customer_data: {
      full_name: string;
      phone_number: string;
    };
    bill_id: null;
    taxes: [];
  };
}

export interface BusinessErrorResponse {
  error: {
    type: string;
    reason: string;
    messages?: Record<string, string[]>;
  };
}
