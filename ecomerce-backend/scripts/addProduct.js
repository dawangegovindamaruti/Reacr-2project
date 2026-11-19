import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function addProduct() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // Define the new product to add
    // Modify these values as needed
    const newProduct = {
      image: 'images/products/tennis-shoe.jpg', // Add your product image path
      name: 'Professional Tennis Shoe', // Change product name
      rating: {
        stars: 4.5,
        count: 42
      },
      priceCents: 9999, // Price in cents (e.g., 9999 = $99.99)
      keywords: ['apparel', 'tennis shoes', 'sports'] // Add relevant keywords for search
    };

    // Create the product in the database
    console.log('Creating new product:', newProduct.name);
    const product = await Product.create(newProduct);
    console.log('Product created successfully!');
    console.log('Product ID:', product._id);
    console.log('Product:', product);

    process.exit(0);
  } catch (error) {
    console.error('Error adding product:', error);
    process.exit(1);
  }
}

// Run the function
addProduct();
