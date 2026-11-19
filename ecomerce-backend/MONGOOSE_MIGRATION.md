# Mongoose Migration Guide

## Migration Complete ✅

Your e-commerce backend has been successfully migrated from **Sequelize** (SQL) to **Mongoose** (MongoDB). Here's what was changed and how to use it.

---

## What Changed

### 1. **Database Connection** (`models/index.js`)
- **Before**: Sequelize with SQLite/MySQL/PostgreSQL support
- **After**: Mongoose with MongoDB

**Connection Setup:**
```javascript
import { connectDB } from './models/index.js';
await connectDB();
```

**Environment Variables:**
```
MONGODB_URI=mongodb://localhost:27017/ecommerce-db
```

For MongoDB Atlas cloud:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce-db?retryWrites=true&w=majority
```

---

### 2. **Models** (All converted to Mongoose schemas)

#### Product Model
```javascript
// Find all products
await Product.find()

// Find by ID
await Product.findById(productId)

// Create new product
await Product.create({ image, name, rating, priceCents, keywords })

// Update
const product = await Product.findById(id);
product.name = 'New Name';
await product.save();

// Delete
await Product.deleteOne({ _id: id })
```

#### CartItem Model
```javascript
// Find all cart items
await CartItem.find()

// Find specific item
await CartItem.findOne({ productId })

// Create
await CartItem.create({ productId, quantity, deliveryOptionId })

// Update
const item = await CartItem.findOne({ productId });
item.quantity = 5;
await item.save();

// Delete
await item.deleteOne()
```

#### Order Model
```javascript
// Find all orders
await Order.find().sort({ orderTimeMs: -1 })

// Find by ID
await Order.findById(orderId)

// Create
await Order.create({ orderTimeMs, totalCostCents, products })

// Delete all
await Order.deleteMany({})
```

#### DeliveryOption Model
```javascript
// Find all options
await DeliveryOption.find()

// Find by ID
await DeliveryOption.findById(optionId)

// Create
await DeliveryOption.create({ id, deliveryDays, priceCents })
```

---

### 3. **API Routes Updated**

All route files have been updated to use Mongoose methods:

| Endpoint | File | Changes |
|----------|------|---------|
| `/api/products` | `routes/products.js` | `findAll()` → `find()` |
| `/api/cart-items` | `routes/cartItems.js` | `findByPk()` → `findById()` |
| `/api/orders` | `routes/orders.js` | `destroy()` → `deleteOne()` / `deleteMany()` |
| `/api/delivery-options` | `routes/deliveryOptions.js` | Updated to Mongoose syntax |
| `/api/payment-summary` | `routes/paymentSummary.js` | Updated to Mongoose syntax |
| `/api/reset` | `routes/reset.js` | `sync()` → `deleteMany()` + `insertMany()` |

---

## Sequelize vs Mongoose Method Mapping

| Sequelize | Mongoose |
|-----------|----------|
| `Model.findAll()` | `Model.find()` |
| `Model.findByPk(id)` | `Model.findById(id)` |
| `Model.findOne({ where: {...} })` | `Model.findOne({...})` |
| `Model.create(data)` | `Model.create(data)` |
| `instance.save()` | `instance.save()` |
| `instance.destroy()` | `instance.deleteOne()` |
| `Model.destroy({ where: {} })` | `Model.deleteMany({})` |
| `Model.bulkCreate(array)` | `Model.insertMany(array)` |
| `Model.count()` | `Model.countDocuments()` |
| `instance.toJSON()` | `instance.toObject()` |

---

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

This installs:
- `mongoose` - MongoDB ODM
- `uuid` - For generating unique IDs
- `express`, `cors` - API framework

### 2. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas (Cloud):**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Set `MONGODB_URI` environment variable

### 3. Run Server
```bash
npm start        # Production
npm run dev      # Development with nodemon
```

---

## Data Migration from SQL to MongoDB

If you have existing SQL data, follow these steps:

1. **Export SQL data** as JSON
2. **Transform the data** to match MongoDB schema (use the defaults as template)
3. **Insert into MongoDB**:
```javascript
await Product.insertMany(productsArray);
await CartItem.insertMany(cartItemsArray);
await DeliveryOption.insertMany(optionsArray);
await Order.insertMany(ordersArray);
```

---

## Key Differences: SQL vs NoSQL

### Document Structure
```javascript
// MongoDB document structure (NoSQL - flexible)
{
  _id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
  image: "...",
  name: "...",
  rating: { stars: 4.5, count: 87 },  // Nested object
  priceCents: 1090,
  keywords: ["socks", "sports", "apparel"],  // Array
  createdAt: 2024-01-01T10:00:00.000Z,
  updatedAt: 2024-01-01T10:00:00.000Z
}
```

### Queries
```javascript
// Find products by keyword
await Product.find({ keywords: "sports" });

// Find expensive products
await Product.find({ priceCents: { $gt: 2000 } });

// Count cart items
await CartItem.countDocuments();

// Find and update
await Product.findByIdAndUpdate(id, { name: "New Name" }, { new: true });
```

### Pagination
```javascript
// Get 10 products, skip first 5
await Product.find().skip(5).limit(10);
```

### Sorting
```javascript
// Sort by price descending
await Product.find().sort({ priceCents: -1 });

// Sort by most recent
await Order.find().sort({ createdAt: -1 });
```

---

## Common Mongoose Patterns

### Schema Validation
```javascript
// Add validation to schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100
  }
});
```

### Middleware (Hooks)
```javascript
// Run code before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
```

### Indexing for Performance
```javascript
// Add index for faster searches
productSchema.index({ name: 'text' });  // Full-text search
productSchema.index({ keywords: 1 });   // Regular index
```

---

## Troubleshooting

### Connection Issues
```
Error: connect ECONNREFUSED
```
**Solution**: Make sure MongoDB is running (`mongod` for local, or check MongoDB Atlas)

### Duplicate Key Error
```
MongoError: E11000 duplicate key error
```
**Solution**: Drop the collection and reinitialize:
```bash
curl -X POST http://localhost:3000/api/reset
```

### Model Not Found
```
Error: Cannot find module
```
**Solution**: Make sure all imports use correct paths and `.js` extensions

---

## Environment Variables

Create a `.env` file in the project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ecommerce-db

# Or for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Server
PORT=3000
```

Then load with `dotenv`:
```bash
npm install dotenv
```

```javascript
import dotenv from 'dotenv';
dotenv.config();
```

---

## Performance Tips

1. **Use Indexes** for frequently queried fields
2. **Lean queries** for read-only operations:
   ```javascript
   await Product.find().lean();  // Returns plain objects, not Mongoose docs
   ```
3. **Select specific fields**:
   ```javascript
   await Product.find().select('name priceCents -_id');
   ```
4. **Batch operations** with `insertMany`, `updateMany`, `deleteMany`

---

## Next Steps

✅ All models migrated to Mongoose  
✅ All routes updated  
✅ Database connection configured  
✅ Default data setup ready  

**To get started:**
1. Install dependencies: `npm install`
2. Start MongoDB
3. Run server: `npm start`
4. Test endpoints with your React frontend

Your API endpoints remain **the same** - all data handling is now through MongoDB via Mongoose!
