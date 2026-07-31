interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  color: string;
  status: 'AVAILABLE' | 'SOLD';
  createdAt: string;
  updatedAt: string;
}

interface RpcError {
  statusCode?: number;
  message?: string;
}
