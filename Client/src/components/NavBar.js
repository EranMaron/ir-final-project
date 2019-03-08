import React from "react";
import { NavLink } from "react-router-dom";

export default class NavBar extends React.Component {
  render() {
    return (
      <div className="ui tabular menu">
        <NavLink exact to="/" className="item">
          Search
        </NavLink>
        <NavLink to="/upload" className="item">
          Upload
        </NavLink>
      </div>
    );
  }
}
