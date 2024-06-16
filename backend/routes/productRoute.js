const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  createProductReview,
  getSingleProductReviews,
  deleteReview,
} = require("../controller/productController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/products").get(getAllProducts);
router
  .route("/products/new")
  .post(isAuthenticatedUser, authorizedRoles("Admin"), createProduct);
router
  .route("/products/:id")
  .put(isAuthenticatedUser, authorizedRoles("Admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizedRoles("Admin"), deleteProduct)
  .get(getSingleProduct);
router.route("/product/review").post(isAuthenticatedUser, createProductReview);
router
  .route("/reviews")
  .get(isAuthenticatedUser, getSingleProductReviews)
  .delete(isAuthenticatedUser, authorizedRoles("Admin"), deleteReview);

module.exports = router;
