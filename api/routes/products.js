/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const express = require("express");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  }
});

const router = express.Router();

const mongoose = require("mongoose");
const Product = require("../models/product");

router.get("/", (request, response, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then(docs => {
      console.log(docs);
      const res = {
        count: docs.length,
        products: docs.map(doc => ({
          name: doc.name,
          price: doc.price,
          // eslint-disable-next-line no-underscore-dangle
          _id: doc._id,
          request: {
            type: "GET",
            url: `http://localhost:3000/products/${doc._id}`
          }
        }))
      };
      response.status(200).json(res);
    })
    .catch(err => {
      console.log(err);
      response.status(404).json({
        error: err
      });
    });
});

router.post("/", upload.single("productImage"), (request, response, next) => {
  console.log(request.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: request.body.name,
    price: request.body.price,
    productImage: request.file.path
  });

  product
    .save()
    // eslint-disable-next-line no-console
    .then(result => {
      console.log(result);
      response.status(201).json({
        message: "created product",
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: "GET",
            url: `http://localhost:3000/products/${result._id}`
          }
        }
      });
    })
    // eslint-disable-next-line no-console
    .catch(err =>
      response.json({
        error: err
      })
    );
});

router.get("/:productId", (request, response, next) => {
  const id = request.params.productId;
  Product.findById(id)
    .exec()
    .then(doc => {
      console.log("From Database", doc);
      // eslint-disable-next-line no-unused-expressions
      // doc
      //   ? response.status(200).json(doc)
      //   : response.status(404).json({ message: 'No valid id provided' });
      // response.status(200).json({
      //   doc,
      // });
      if (doc) {
        const result = {
          name: doc.name,
          price: doc.price,
          id: doc._id
        };
        response.status(200).json(result);
      } else {
        response.status(404).json({
          message: "No valid ID found"
        });
      }
    })
    .catch(err => {
      console.log(err);
      response.json({
        error: err
      });
    });
});

router.patch("/:productId", (request, response, next) => {
  const id = request.params.productId;
  const updateOps = {};
  for (const ops of request.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.update(
    { _id: id },
    {
      $set: updateOps
    }
  )
    .exec()
    .then(result => {
      console.log(result);
      response.status(200).json({
        message: "Updated Successfully!"
      });
    })
    .catch(err => {
      console.log(err);
      response.status(500).json({
        error: err
      });
    });
});

router.delete("/:productId", (request, response, next) => {
  Product.remove({ _id: request.params.productId })
    .exec()
    .then(result => {
      console.log(result);
      response.status(200).json({ message: "Deleted Successfully" });
    })
    .catch(err => {
      console.log(err);
      response.status(500).json({
        error: err
      });
    });
});

module.exports = router;
