/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AxiosResponse } from 'axios'

export const productsApi = {
  getAll: () => Promise.resolve({ data: [] } as AxiosResponse),
  getById: (_id: string) => Promise.resolve({ data: null } as AxiosResponse)
}

export const transactionsApi = {
  create: (_data: unknown) => Promise.resolve({ data: null } as AxiosResponse),
  getById: (_id: string) => Promise.resolve({ data: null } as AxiosResponse)
}
