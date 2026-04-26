# Product Seeding Policy

## 🚫 **IMPORTANT: Automatic Product Seeding Disabled**

### **Current Status**
- ✅ **Product seeding has been disabled**
- ✅ **Only manually added products via admin panel are allowed**
- ✅ **Automatic cleanup of seeded products is enabled**

### **What This Means**
1. **No more automatic products** will be added to the database
2. **Only your 16 manually added products** will appear in the catalog
3. **Any seeded products** will be automatically removed during seed runs

### **Files Updated**
- `src/seed.ts` - Main seeding file (TypeScript)
- `prisma/seed.js` - Legacy seeding file (JavaScript)
- Both files now include automatic cleanup of seeded products

### **Protected Product IDs**
The following seeded product IDs are automatically blocked/cleaned:
```
mustard-500ml, mustard-1l, mustard-5l, mustard-15l
soyabean-500ml, soyabean-1l, soyabean-5l, soyabean-15l  
groundnut-500ml, groundnut-1l, groundnut-5l, groundnut-15l
sunflower-500ml, sunflower-1l, sunflower-5l, sunflower-15l
```

### **Your Products (Preserved)**
Your 16 manually added products with IDs like `prod_d286a344d5`, `prod_4f5c873027`, etc. are **100% safe** and will never be affected by seeding operations.

### **For Future Developers**
⚠️ **DO NOT** re-enable product seeding unless you want to reset the entire product catalog.

If you need to add products:
1. Use the admin panel at `/admin`
2. Or create a separate, controlled migration script

### **Emergency Cleanup**
If seeded products ever appear again, run:
```bash
npm run remove-seeded
```

---
**Last Updated**: April 26, 2026  
**Status**: Product seeding permanently disabled ✅
