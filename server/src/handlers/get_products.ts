import { type GetProductsInput, type Product } from '../schema';

export async function getProducts(input?: GetProductsInput): Promise<Product[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to:
    // 1. Query products from database with optional filters (category, provider, is_active)
    // 2. Order by sort_order and created_at
    // 3. Return filtered and sorted product list
    // 4. Only return active products by default unless explicitly requested
    
    return Promise.resolve([
        {
            id: 1,
            name: 'Telkomsel 10K',
            description: 'Pulsa Telkomsel 10.000',
            category: 'PULSA',
            provider: 'Telkomsel',
            denomination: 10000,
            price: 10500,
            cost_price: 10200,
            is_active: true,
            sort_order: 1,
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: 2,
            name: 'XL Data 1GB',
            description: 'Paket Data XL 1GB 30 Hari',
            category: 'DATA_PACKAGE',
            provider: 'XL',
            denomination: 1,
            price: 15000,
            cost_price: 14500,
            is_active: true,
            sort_order: 2,
            created_at: new Date(),
            updated_at: new Date()
        }
    ]);
}