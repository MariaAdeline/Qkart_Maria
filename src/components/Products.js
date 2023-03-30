import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";
import Cart,{ generateCartItemsFrom } from "./Cart";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {
  let[isLoading,setLoading]=useState(false);
  let[products, setProducts] = useState([]);
  let[valid,setValid]=useState(true);
  let [debounceTimeout,setdebounceTimeout]=useState(0);
  let[loggedin,setloggedin]=useState(false)
  const token=localStorage.getItem('token')
  let { enqueueSnackbar } = useSnackbar();
  let[cartData,setcartData]=useState(" ");
  let[productsData,setproductsData]=useState([])
  const [displayAtc, setDisplayAtc] = useState([]);
  

  
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */

  useEffect(async()=>
  {
    let data_products= await performAPICall();
    setProducts(data_products);
    if(localStorage.getItem('username'))
    { 
      setloggedin(true);
      let cart_data=await fetchCart(token);
      console.log("fetch cart")
      console.log(data_products)
      let data_details = generateCartItemsFrom(cart_data, data_products);
      setDisplayAtc(data_details);
    }
    //   
    //   let url = `${config.endpoint}/cart`;
    //   for (let i = 0; i < cartData.length; i++) {
    //     axios.post(url, cartData[i], {
    //       headers: {
    //         'Authorization': `Bearer ${token}`
    //       }
    //     });
    //   }
    // }

  },[])


  const performAPICall = async () => {
    try{
    console.log('performing api call')
    setLoading(true)
    const response = await axios.get(`${config.endpoint}/products`)
    const data = response.data;
    setProducts(data)
    setproductsData(data);
    setLoading(false)
    return data;
    
    }
    catch(error){
      setLoading(false)
      console.log('api call error')
    }
    };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try {
      const response = await axios.get(`${config.endpoint}/products/search?value=${text}`);
      const data = response.data;

      setProducts(data);
      
      setValid(true);
    }
    catch (error) {
      console.log(error)
      setProducts([])
      setValid(false);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    let search = event.target.value;
    // setSearchKey(search);
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    let timeOut = setTimeout(() => {
      performSearch(search);
    }, 500); 
    setdebounceTimeout(timeOut);
    };

  const fetchCart= async (token)=>{

  try{
    console.log('inside fetch cart')
    console.log(token)
    const response = await axios.get(`${config.endpoint}/cart`,{
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
   
   const data=response.data;
   console.log(data)
   setcartData(data);
   return data;
  }
  catch(e){
      console.log(e.response);
      console.log('fetch error')
  }

};

const postCart = async(productId, qty) => {
  let body = {"productId": productId,"qty": qty};
  console.log(body);
try{
  console.log('before post');
 let response = await axios.post(`${config.endpoint}/cart`,body, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-type' : 'application/json'
    }
  });
  console.log('after post');
  setcartData(response.data);
  let data = generateCartItemsFrom(response.data, products);
  setDisplayAtc(data);
}
catch(err){
  console.log(err);
  console.log('post error')
  enqueueSnackbar("Login to add an item to the Cart", { variant: 'warning' })
}

}
// TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */

const isItemInCart = (items, productId) => {
  console.log(' is item in cart')
  console.log(productId)
  console.log(items.productId)
  for(let i=0;i<items.length;i++) {
    console.log('inside')
    console.log(productId)
    console.log(items[i].productId)
    if (items[i].productId === productId) {
      console.log('inside item cart')
      return true;
    }
  }
  console.log('false')
  return false;
  
};
/**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */

const addToCart = async (
  token,
  items,
  products,
  productId,
  qty,
  options = { preventDuplicate: false }
) => {
  if(token){

    if(options.preventDuplicate){
      console.log("293")
      console.log(products)
       if(isItemInCart(cartData, productId)) {
     
      enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: 'warning' })
       }
      // let postDataToCart = {
      //   "productId": productId,
      //   "qty": qty
      // }
      // let url = `${config.endpoint}/cart`;
      // try {
      //   const response = await axios.post(url, postDataToCart, {
      //     headers: {
      //       'Authorization': `Bearer ${token}`
      //     }
      //   })
      //   const PostData = response.data
      //   console.log("PostCartData", PostData)
        
      //   setcartData(PostData);
      // }
      // catch (e) {
      //   if (e.response && e.response.status === 400) {
      //     return enqueueSnackbar(e.response.data.message, { variant: 'error' });
      //   }
      //   enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: 'warning' })
      // }
    
    else{
      console.log(productId);
      console.log(qty);
      postCart(productId, qty);
    }
  }
  else{
    postCart(productId, qty);
  }
  }
  else{
    enqueueSnackbar("Login to add an item to the Cart", { variant: 'warning' })
    return null;
  }
};

const handleQuantity = (productId, qty) => {

  
  let options = {preventDuplicate:false}
  if(qty === 0){
    
    options = {...options, ["delete"]:true}

  }
 let token = localStorage.getItem("token");
 console.log('handle quantity');
  
addToCart(token, cartData,productsData, productId, qty, options );
  
}
if(localStorage.getItem("username")){
  return (  
    <div>
      <Header children ={
      <TextField className="search-desktop" size="small"
                       InputProps={{className: "search",endAdornment: (
                                <InputAdornment position="end">
                                   <Search color="primary" />
                                </InputAdornment>
                                 ),
                                  }}
            placeholder="Search for items/categories"
            name="search"
            onChange={(event)=> debounceSearch(event,debounceTimeout)}
            
          />
        
        }/>
        
      

        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}

      

      {/* Search view for mobiles */}
      
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(event)=> debounceSearch(event,debounceTimeout)}
      />
    
       <Grid container>
        <Grid container spacing={2} xs={12} md={9}>
         <Grid item className="product-grid" md={12}>
           <Box className="hero">
             <p className="hero-heading">
               India's <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
           </Grid> 
       
       { isLoading?
            (<Box className='loading'>
            <CircularProgress />
            <p>Loading Products...</p>
            </Box> ): 
            valid?
            <Grid container spacing={2} px="1rem" my="1rem">
            {products.map((product) => (
             <Grid item xs={6} md={3} className="product-grid" key={product._id}>
               <ProductCard
                 product={product} handleAddToCart = {addToCart}
               />
             </Grid>))} 
             </Grid>:
             <Box className="loading">
              <SentimentDissatisfied />
              <p>No products found</p>
            </Box>}
            </Grid>
            {loggedin?
            <Grid xs={12} md={3} bgcolor="#E9F5E1" >
              <Cart items = {displayAtc}  handleQuantity = {handleQuantity}  />
            
          </Grid>:<></>}
           
       </Grid>
       </div>
       );
}         
else {
  console.log('inside')
  return (
    
    <div>
      <Header children ={
      <TextField className="search-desktop" size="small"
                       InputProps={{className: "search",endAdornment: (
                                <InputAdornment position="end">
                                   <Search color="primary" />
                                </InputAdornment>
                                 ),
                                  }}
            placeholder="Search for items/categories"
            name="search"
            onChange={(event)=> debounceSearch(event,debounceTimeout)}
            
          />
        
        }/>
        
      

        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}

      

      {/* Search view for mobiles */}
      
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(event)=> debounceSearch(event,debounceTimeout)}
      />
  <Grid container>
        <Grid container spacing={2} xs={12} >
         <Grid item className="product-grid">
           <Box className="hero">
             <p className="hero-heading">
               India's <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
           </Grid> 
       
       { isLoading?
            (<Box className='loading'>
            <CircularProgress />
            <p>Loading Products...</p>
            </Box> ): 
            valid?
            <Grid container spacing={2} xs={12} px="1rem" my="1rem">
            {products.map((product) => (
             <Grid item xs={6} md={3} className="product-grid" key={product._id}>
               <ProductCard
                 product={product} handleAddToCart = {addToCart}
               />
             </Grid>))} 
             </Grid>:
             <Box className="loading">
              <SentimentDissatisfied />
              <p>No products found</p>
            </Box>
            }
            </Grid>
            </Grid>
            
      <Footer />
    </div>
  
    );
  }
};
          



export default Products;