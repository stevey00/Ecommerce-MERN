const express = require("express");
const {
  createOrder,
  getSingleOrder,
  getAllOrders,
  getAdminAllOrders,
  updateAdminOrder,
  deleteAdminOrder,
} = require("../controller/orderController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, createOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, getAllOrders);
router
  .route("/Admin/orders")
  .get(isAuthenticatedUser, authorizedRoles("Admin"), getAdminAllOrders);
router
  .route("/Admin/order/:id")
  .put(isAuthenticatedUser, authorizedRoles("Admin"), updateAdminOrder)
  .delete(isAuthenticatedUser, authorizedRoles("Admin"), deleteAdminOrder);

module.exports = router;
