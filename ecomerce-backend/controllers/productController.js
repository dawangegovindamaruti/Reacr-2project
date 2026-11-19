import { Product } from '../models/Product.js';

// GET all products with optional search filter
export const getAllProducts = async (req, res) => {
  try {
    const search = req.query.search;
    let products = await Product.find().sort({ createdAt: 1 });

    if (search) {
      const lowerCaseSearch = search.toLowerCase();
      products = products.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(lowerCaseSearch);
        const keywordsMatch = product.keywords.some(keyword => 
          keyword.toLowerCase().includes(lowerCaseSearch)
        );
        return nameMatch || keywordsMatch;
      });
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// CREATE a new product
export const createProduct = async (req, res) => {
  try {
    const { image, name, rating, priceCents, keywords } = req.body;

    // Validate required fields
    if (!image || !name || rating === undefined || priceCents === undefined || !keywords) {
      return res.status(400).json({
        error: 'Missing required fields: image, name, rating, priceCents, keywords'
      });
    }

    // Validate keywords is an array
    if (!Array.isArray(keywords)) {
      return res.status(400).json({
        error: 'keywords must be an array'
      });
    }

    // Create new product
    const newProduct = await Product.create({
      image,
      name,
      rating,
      priceCents,
      keywords
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      error: 'Failed to create product',
      details: error.message
    });
  }
};

// GET single product by ID
export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, rating, priceCents, keywords, image } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (rating !== undefined) updateData.rating = rating;
    if (priceCents !== undefined) updateData.priceCents = priceCents;
    if (keywords !== undefined) updateData.keywords = keywords;
    if (image !== undefined) updateData.image = image;

    const product = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// DELETE product
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
