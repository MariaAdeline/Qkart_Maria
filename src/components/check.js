import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

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

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */



const Checkout = () => {
  let [items, setItems] = useState([]);
  let [products, setProducts] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const token=localStorage.getItem('token');
  let[addresses,setAddresses]=useState({all:[],selected:" "})
  const history=useHistory();
  let[edit,setEdit]=useState(true);
  let [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });



  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // Fetch cart data
  const fetchCart = async (token) => {
    if (token){
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
    }
  };

  const getAddresses = async (token) => {
    if (token){
    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAddresses((currAddresses) => ({
        
        ...currAddresses,
        all: response.data,
       
      }));
      return response.data;
    } catch {
      enqueueSnackbar("Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",{variant: "error",});
      return null;
    }
  }
  };

  const addAddress = async (token, newAddress) => {
    try {
      const response = await axios.post(`${config.endpoint}/user/addresses`, {
        "address": newAddress,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data
      console.log("adddedAddress", data)
      setAddresses((currAddresses) => ({
        ...currAddresses,
        all: response.data,
      }));

      setNewAddress({
        isAddingNewAddress: false,
        value: "",
      })

    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const deleteAddress = async (token, Id) => {
    try {
      const response = await axios.delete(`${config.endpoint}/user/addresses/${Id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data
      console.log("addressAfterDelete", data)
      setAddresses((currAddresses) => ({
        ...currAddresses,
        all: response.data,
      }));

    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const AddNewAddressView = () => {
    return (
      <Box display="flex" flexDirection="column">
        <TextField
          multiline
          minRows={3}
          type="text"
          
          value={newAddress.value}
          label="Enter your complete address" 
          variant="outlined"
          onChange={(event) => setNewAddress(
            {
              value: event.target.value
            }
          )}
        />
        <Stack direction="row" my="1rem">
          <Button
            variant="contained"
            onClick={() => addAddress(token, newAddress.value)}
          >
            Add
          </Button>
          <Button
            variant="text"
            onClick={() => setEdit(true)}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    );
  };

  useEffect(() => 
  {
      const onLoad = async () => {
      let productsData = await getProducts();
      let cartData = await fetchCart(token);
      
      let cartDetails =  generateCartItemsFrom(cartData, productsData);
      setItems(cartDetails);
      };
      onLoad();
      const address = async () => {
      if (token) {
        await getAddresses(token)
      }
      else {
        enqueueSnackbar("You must be logged in to access checkout page",{variant: "warning"});
        history.push("/login")
      }
      };
      address();
  }, []);

  const toggleSelect = (id) => {
    if (id === addresses.selected) 
    return "selected";
    else 
    return "not-selected";
  };

  

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
            </Box>
            {addresses.all.length>0  ? 
            addresses.all.map((item)=>{
              <Box key={item._id}
              onClick={() => {
                setAddresses({ ...addresses, selected: item._id });
              }}
              className={toggleSelect(item._id)}
              >

              <Typography >
                {item.address}
              </Typography>

              <Button
                startIcon={<Delete/>}
                variant="text"
                onClick={() => deleteAddress(token, item._id)}
              >
                DELETE
              </Button>
            </Box>
            })
            : 
            <Typography color="#3C3C3C" my="1rem">
            No addresses found for this account. Please add one to proceed
            </Typography>}

            {edit?
            <Button
              variant="contained"
              id="add-new-btn"
              onClick={() => setEdit(false)}
            >
              Add new address
            </Button> :
            <AddNewAddressView/>
            }           

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly products={products} items={items} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
