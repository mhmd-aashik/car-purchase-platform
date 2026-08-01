export interface PurchaseCompletedEvent {
  eventId: string;
  eventType: 'purchase.completed';
  occurredAt: string;
  data: {
    purchaseId: string;
    carId: string;
    userId: string;
    userEmail: string;
    carBrand: string;
    carModel: string;
    amount: number;
  };
}
