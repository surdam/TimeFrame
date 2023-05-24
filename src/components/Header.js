import React from "react";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";
import logo from "../TFrame-04.png";
import "../styles.css";

const Header = () => {
  return (
    <header className="header">
      <Link to="/" className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
        <Typography
          variant="h1"
          style={{
            letterSpacing: ".07rem",
            fontSize: "26px",
            fontWeight: "normal"
          }}
          className="logo-text"
        ></Typography>{" "}
      </Link>
    </header>
  );
};

export default Header;
