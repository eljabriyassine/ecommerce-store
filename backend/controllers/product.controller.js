import redis from "../lib/redis.js";
import Product from "../models/product.model.js";

import dotenv from "dotenv";

dotenv.config();

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.send({ products });
  } catch (error) {
    res.send("internal server error" + error.message);
  }
};

export const getFeaturedProduct = async (req, res) => {
  //check the cache
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.status(200).json(JSON.parse(featuredProducts));
    }
    //if redis contains no freatued product fetch them from mongo
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res.send(404).send({ message: "no featured products found" });
    }

    //store them in redis
    redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json(featuredProducts);
  } catch (error) {
    res.send(500).send({ error: error.message });
  }
};

//saving product to mongo and cloudinary
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    let response = null;
    if (image) {
      response = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }
    const product = new Product.create({
      name,
      description,
      price,
      category,
      image: response?.secure_url ? response.secure_url : "",
    });
    res.status.send({ product });
  } catch (error) {
    res.status(500).send({ message: "internal server error" + error.message });
  }
};

//delete product from mongo and cloudinary
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).send({ message: "product not found" });
    }
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await product.remove();
    res.send({ message: "product deleted" });
  } catch (error) {
    res.status(500).send({ message: "internal server error" + error.message });
  }
};

//recommended products :getting radnom products from mongo for test
export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 5 } },
      { $project: { _id: 1, name: 1, description: 1, image: 1, price: 1 } },
    ]);
    res.send({ products });
  } catch (error) {
    res.send("internal server error" + error.message);
  }
};

//get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.send({ products });
  } catch (error) {
    res.send("internal server error" + error.message);
  }
};

//toggle featured product
export const toggleFeaturedProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).send({ message: "product not found" });
    }
    product.isFeatured = !product.isFeatured;
    await product.save();

    //update cache
    await updateFeaturedProductsCache();

    res.send({ message: "product updated" });
  } catch (error) {
    res.status(500).send({ message: "internal server error" + error.message });
  }
};

//update featured products cache
const updateFeaturedProductsCache = async () => {
  try {
    let featuredProducts = await Product.find({ isFeatured: true }).lean();
    redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error updating cache", error.message);
  }
};
