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

/**
 * @typedef {Object} Address - Data on added address
 *
 * @property {string} _id - Unique ID for the address
 * @property {string} address - Full address string
 */

/**
 * @typedef {Object} Addresses - Data on all added addresses
 *
 * @property {Array.<Address>} all - Data on all added addresses
 * @property {string} selected - Id of the currently selected address
 */

/**
 * @typedef {Object} NewAddress - Data on the new address being typed
 *
 * @property { Boolean } isAddingNewAddress - If a new address is being added
 * @property { String} value - Latest value of the address being typed
 */

// TODO: CRIO_TASK_MODULE_CHECKOUT - Should allow to type a new address in the text field and add the new address or cancel adding new address
/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { String } token
 *    Login token
 *
 * @param { NewAddress } newAddress
 *    Data on new address being added
 *
 * @param { Function } handleNewAddress
 *    Handler function to set the new address field to the latest typed value
 *
 * @param { Function } addAddress
 *    Handler function to make an API call to add the new address
 *
 * @returns { JSX.Element }
 *    JSX for the Add new address view
 *
 */

 const AddNewAddressView = ({
  token,
  newAddress,
  setNewAddress,
  addAddress,
  setEdit
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        variant="outlined"
        value={newAddress.value}
        onChange={(error) => setNewAddress(
          {
            value: error.target.value
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

 const Checkout = () => {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const token = localStorage.getItem("token");
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const history = useHistory();
  const [edit, setEdit] = useState(true)
  const [newAddress, setNewAddress] = useState({
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

  const validateRequest = (items, addresses) => {

    if (!addresses.all.length) {
      enqueueSnackbar("Please add a new address before proceeding.", {
        variant: 'warning',
      })
      return false
    }

    if (getTotalCartValue(items) > localStorage.getItem("balance")) {
      enqueueSnackbar("You do not have enough balance in your wallet for this purchase", {
        variant: 'warning',
      })
      return false
    }

    if (addresses.selected === "") {
      enqueueSnackbar("Please select one shipping address to proceed", {
        variant: 'warning',
      })
      return false

    }

    return true
  };

  const performCheckout = async (token, items, addresses) => {

    let postData = {
      "addressId": addresses.selected
    }

    if (validateRequest(items, addresses)) {
      try {
        await axios.post(`${config.endpoint}/cart/checkout`, postData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        enqueueSnackbar('Order placed successfully!', {
          variant: 'success',
        })
        const updBalance = localStorage.getItem("balance") - getTotalCartValue(items);
        localStorage.setItem("balance", updBalance)
        history.push("/thanks")
      }
      catch (e) {
        if (e.response && e.response.status === 400) {
          return enqueueSnackbar(e.response.data.message, { variant: 'error' });
        }
        else {
          enqueueSnackbar("Wallet balance not sufficient to place order", { variant: 'error' });
        }

      }
    }


  };


  useEffect(() => {
    const onLoad = async () => {
      const productsData = await getProducts();

      const cartData = await fetchCart(token);
      const cartDetails = generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      
    };
    onLoad();

    const address = async () => {
      if (token) {
        await getAddresses(token)
      }
      else {
        enqueueSnackbar(
          "You must be logged in to access checkout page",
          {
            variant: "warning",
          }
        );
        history.push("/login")
      }
    };
    address();
    
  }, []);
  

  const toggleSelect = (id) => {
    if (id === addresses.selected) 
    return "address-item selected";
    else 
    return "address-item not-selected";
  };

  return (
    <>
      <Header hasHiddenAuthButtons={true} />
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

            {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Display list of addresses and corresponding "Delete" buttons, if present, of which 1 can be selected */}

            {addresses.all.length ? addresses.all.map((item) =>
            (<Box key={item._id}
              onClick={() => {
                setAddresses({ ...addresses, selected: item._id });
              }}
              className={toggleSelect(item._id)}
            >
              <Typography >
                {item.address}
              </Typography>
              <Button
                startIcon={<Delete />}
                variant="text"
                onClick={() => deleteAddress(token, item._id)}>
                DELETE
              </Button>
            </Box>
            ))
              : <Typography my="1rem">
                No addresses found for this account. Please add one to proceed
              </Typography>}

            {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Dislay either "Add new address" button or the <AddNewAddressView> component to edit the currently selected address */}
            {edit ? <Button
              color="primary"
              variant="contained"
              id="add-new-btn"
              size="large"
              onClick={() => setEdit(false)}
            >
              Add new address
            </Button>
              : <AddNewAddressView
                token={token}
                newAddress={newAddress}
                setNewAddress={setNewAddress}
                addAddress={addAddress}
                setEdit={setEdit}/>
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
              onClick={() => performCheckout(token, items, addresses)}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly={true} products={products} items={items} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
