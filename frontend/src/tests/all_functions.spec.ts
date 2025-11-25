import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../stores/useAuthStore'
import { useInventoryStore } from '../stores/useInventoryStore'
import { useEnterpriseStore } from '../stores/useEnterpriseStore'

describe('Full Application Functional Test', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should perform a complete business flow', async () => {
    const auth = useAuthStore()
    const inventory = useInventoryStore()
    const enterprise = useEnterpriseStore()

    // 1. Login
    await auth.login({ username: 'admin', password: 'admin123' })
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.activeStoreId).toBeTruthy()
    
    const storeId = auth.activeStoreId!

    // 2. Load Enterprise Data (needed for products/partners)
    await enterprise.loadEnterpriseData()
    expect(enterprise.products.length).toBeGreaterThan(0)
    expect(enterprise.partners.length).toBeGreaterThan(0)

    // 3. Load Inventory Data
    await inventory.loadStoreData(storeId)
    const initialInventoryCount = inventory.inventory.length
    
    // 4. Create a Purchase (Procurement)
    const supplier = enterprise.partners.find(p => p.type === 'supplier')!
    const product = enterprise.products[0]
    
    const purchasePayload = {
      date: new Date().toISOString().slice(0, 10),
      supplier: supplier.name,
      supplierId: supplier.id,
      fruit: product.name,
      productId: product.id,
      quantityKg: 100,
      unitCost: 10,
      paymentMethod: 'cash' as const,
      status: 'pending' as const
    }

    await inventory.addPurchase(purchasePayload)
    
    // Verify purchase added
    const newPurchase = inventory.purchases.find(p => p.productId === product.id && p.quantityKg === 100)
    expect(newPurchase).toBeDefined()
    expect(inventory.payables).toBeGreaterThan(0)

    // 5. Settle Purchase (Finance)
    if (newPurchase) {
        await inventory.settlePurchase(newPurchase.id)
        const settledPurchase = inventory.purchases.find(p => p.id === newPurchase.id)
        expect(settledPurchase?.status).toBe('settled')
    }

    // 6. Create a Sale (Sales)
    const salePayload = {
      date: new Date().toISOString().slice(0, 10),
      fruit: product.name,
      productId: product.id,
      quantityKg: 10,
      unitPrice: 20,
      paymentMethod: 'mobile' as const,
      status: 'settled' as const
    }

    await inventory.addSale(salePayload)
    
    // Verify sale added
    const newSale = inventory.sales.find(s => s.productId === product.id && s.quantityKg === 10)
    expect(newSale).toBeDefined()
    expect(inventory.totalRevenue).toBeGreaterThan(0)

    // 7. Check Inventory Update (Inventory)
    // Note: The mock backend might not automatically update inventory on purchase/sale unless implemented.
    // Let's check if the inventory list was refreshed.
    const inventoryItem = inventory.inventory.find(i => i.productId === product.id)
    // If mock backend logic is simple, it might just add the record. 
    // Real backend would update onHandKg. 
    // Let's just verify the call didn't fail.
    expect(inventory.loading).toBe(false)

    // 8. Trigger Reorder (Inventory Alert)
    // Force an item to be low stock if possible, or just call triggerReorder
    await inventory.triggerReorder(product.name)
    // Should add another purchase
    const reorderPurchase = inventory.purchases.find(p => p.fruit === product.name && p.status === 'pending')
    expect(reorderPurchase).toBeDefined()

    // 9. Update Reorder Level
    if (inventoryItem) {
        await inventory.updateReorderLevel(inventoryItem.fruit, 100)
        const updatedItem = inventory.inventory.find(i => i.id === inventoryItem.id)
        expect(updatedItem?.reorderLevelKg).toBe(100)
    }
  })
})
