const express = require("express");

const app = express();

const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");

// Configuration: CORS
// eslint-disable-next-line consistent-return
app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Header",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (request.method === "OPTIONS") {
    response.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE");
    return response.status(200).json({});
  }
  next();
});

// Mongoose Connection
mongoose.connect(
  "mongodb+srv://dienigma:jy93Ma2rA5ulQNoS@testclusterone-umiol.mongodb.net/test?retryWrites=true&w=majority",
  {
    useNewUrlParser: true
  }
);

// Configuring morgan for logging.
app.use(morgan("dev"));

// Configuration: body parser.
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());

// Route handler
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

// Error handler
app.use((request, response, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, request, response) => {
  response.status(error.status || 500);
  response.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
