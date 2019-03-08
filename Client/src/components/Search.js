import React, { Component } from "react";
import axios from "axios";

export default class Search extends Component {
  HandleSearch = e => {
    e.preventDefault();
    let query = this.query.value;

    const data = new FormData();
    data.append("query", query);

    axios
      .post(`http://localhost:3000/search`, data)
      .then(res => console.log(res));
  };
  render() {
    return (
      <form className="ui form" onSubmit={this.HandleSearch}>
        <div style={{ display: "flex" }}>
          <div className="ui fluid icon input" style={{ width: "95%" }}>
            <input type="text" ref={input => (this.query = input)} />
            <i className="search icon" />
          </div>
          <button className="ui button" style={{ marginLeft: "2%" }}>
            Search
          </button>
        </div>
      </form>
    );
  }
}
