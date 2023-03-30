import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  let token = localStorage.getItem("token");


// const prod=
//   {
//   "name":"Tan Leatherette Weekender Duffle",
//   "category":"Fashion",
//   "cost":150,
//   "rating":4,
//   "image":"https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
//   "_id":"PmInA797xJhMIPti"
//   }
  return (
    <Card className="card">
      <CardMedia component="img" image= {product.image} alt={product.name} />
      <CardContent>
          <Typography variant="h5">
            {product.name}
          </Typography>
          {/* <Typography variant="h5">
            {product.category}
          </Typography> */}
          <Typography variant="h5">
            <b>${product.cost}</b>
          </Typography>
      </CardContent>
      <Rating name="read-only" value={product.rating} readOnly />
      <CardActions className="card-actions">
        <Button size="large" fullWidth key={product._id} variant="contained" className="card-button" onClick={() => (handleAddToCart(token, {'productId' : product._id, 'qty' : 1},product,product._id, 1, { preventDuplicate: true }))}>
          <AddShoppingCartOutlined />
          ADD TO CART
          </Button>
      </CardActions>
    </Card>

  );
};

export default ProductCard;