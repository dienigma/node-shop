/* eslint-disable no-unused-vars */
const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");

const router = express.Router();

// eslint-disable-next-line no-unused-vars
router.get("/", (request, response, next) => {
  Order.find()
    .select("product quantity_id")
    .populate("product", "name")
    .exec()
    .then(result => {
      response.status(200).json({
        count: result.length,
        orders: result.map(doc => ({
          // eslint-disable-next-line no-underscore-dangle
          _id: doc._id,
          product: doc.product,
          quantity: doc.quantity,
          request: {
            type: "GET",
            // eslint-disable-next-line no-underscore-dangle
            url: `http://localhost:3000/orders/${doc._id}`
          }
        }))
      });
    })
    .catch(err => response.status(500).json({ error: err }));
});

router.post("/", (request, response, next) => {
  Product.findById(request.body.productId)
    .then(async product => {
      if (!product) {
        response.status(404).json({
          message: "Product not found"
        });
      } else {
        const order = new Order({
          _id: mongoose.Types.ObjectId(),
          quantity: request.body.quantity,
          product: request.body.productId
        });
        try {
          const result = await order.save();
          console.log(result);
          response.status(201).json({
            message: "Order Stored",
            createdOrder: {
              result
            },
            request: {
              type: "GET",
              // eslint-disable-next-line no-underscore-dangle
              url: `http://localhost:3000/${result._id}`
            }
          });
        } catch (err) {
          response.status(500).json({
            error: err
          });
        }
      }
    })
    .catch(err => {
      response.status(500).json({
        error: err
      });
    });
});

router.get("/:orderId", (request, response, next) => {
  const id = request.params.orderId;
  Order.findById(id)
    .populate("product", "name")
    .exec()
    .then(result => {
      response.status(200).json({
        // eslint-disable-next-line no-underscore-dangle
        _id: result._id,
        product: result.product,
        quantity: result.quantity,
        request: {
          type: "GET",
          // eslint-disable-next-line no-underscore-dangle
          url: "http://localhost:3000/orders/"
        }
      });
    })
    .catch(err => {
      response.status(404).json({
        error: err
      });
    });
});

router.delete("/:orderId", (request, response, next) => {
  Order.remove({ _id: request.params.orderId })
    .exec()
    .then(() => {
      response.status(200).json({
        message: "Order Deleted"
      });
    })
    .catch(err => response.status(404).json({ error: err }));
});

module.exports = router;
