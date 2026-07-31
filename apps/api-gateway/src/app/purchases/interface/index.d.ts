interface Purchase {
  id: string;
  carId: string;
  userId: string;
  carBrand: string;
  carModel: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

interface RpcError {
  statusCode?: number;
  message?: string;
}
