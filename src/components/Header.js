import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const name = localStorage.getItem("username");
  const history=useHistory();
  let textbox=<box></box>;
  if(!hasHiddenAuthButtons){
    textbox = children;
  }
  const logoutButton = () =>{
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("balance");
    history.push("/")
    window.location.reload();
  }
  const logOutHeader = <Stack direction="row" spacing={1} alignItems="center" key="logout">
          <Avatar src="avatar.png" alt={name} />
          <b>{localStorage.getItem('username')}</b>
          <Button onClick={logoutButton}> LOGOUT </Button> 
        </Stack>    
         
  const loginreg = <Stack direction="row" spacing={1} key="login">
          <Button variant="text" onClick={() => history.push("/login")}>LOGIN</Button>
          <Button variant="contained" onClick={() => history.push("/register")}>REGISTER</Button>
        </Stack>
  
  let loginout=localStorage.getItem("username")? logOutHeader:loginreg    

  const explore =<Button
  className="explore-button"
  startIcon={<ArrowBackIcon />}
  variant="text"
  onClick={() => history.push("/")}
  >
  Back to explore
</Button>
    
        
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"/>
        </Box>
      {textbox}
      {hasHiddenAuthButtons ? explore:loginout}
        
        
          
      </Box>
    );
};

export default Header;
