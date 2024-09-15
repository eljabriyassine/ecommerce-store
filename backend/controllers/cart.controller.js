//impliment those funtion

import Product from "../models/product.model";

// addToCart,
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const productIsExist = user.cartitems.find(
      (item) => item.product == productId
    );
    if (productIsExist) {
      productIsExist.quantity += 1;
    } else {
      user.cartItems.push({ product: productId });
    }
    await user.save();
    res.status(200).json(user.cartItems);
  } catch (error) {
    res.status(500).send({ message: "internal server error" + error.message });
  }
};

// getCartProducts,
export const getCartProducts = async (req, res) => {
  try {
    const user = req.user;

    const products = await Product.find({ _id: { $in: user.cartitems } });

    const cartItems = products.map((product) => {
      const item = user.cartItems.find(
        (cartItem) => cartItem.id === product.id
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });

    res.json(cartItems);
    res.status(200).json(user.cartItems);
  } catch (error) {
    res.status(500).send({ message: "internal server error" + error.message });
  }
};

// removeAllFromCart,
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const req = user.req;
    const product = user.cartItems.find((item) => item.product == productId);
    if (!product) {
      return res.status(404).send({ message: "product not found" });
    }

    user.cartItems = user.cartItems.filter((item) => item.product != productId);
    await user.save();
    res.status(200).json(user.cartItems);
  } catch (error) {
    res.status(500).send({ message: "internal server error" + error.message });
  }
};
// updateQuantity,
export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const product = user.cartItems.find((item) => item.product == productId);

    if (!product) {
      return res.status(404).send({ message: "product not found" });
    }

    if (quantity === 0) {
      user.cartItems = user.cartItems.filter(
        (item) => item.product != productId
      );
      await user.save();
      return res.status(200).json(user.cartItems);
    }
    product.quantity = quantity;
    await user.save();
    res.status(200).json(user.cartItems);
  } catch (error) {
    res.status(500).send({ message: "internal server error" + error.message });
  }
};
