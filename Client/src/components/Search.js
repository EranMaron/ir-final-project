import React, { Component } from "react";
import axios from "axios";

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = { isSoundexActivated: false };
  }

  handleInputChange = e => {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;

    this.setState({
      isSoundexActivated: value
    });
  };

  HandleSearch = e => {
    e.preventDefault();
    let query = this.query.value;
    let soundex = this.state.isSoundexActivated;

    const data = new FormData();
    data.append("query", query);
    data.append("soundex", soundex);

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
        </div>
        <button className="ui button" style={{ marginLeft: "2%" }}>
          Search
        </button>
        <label>
          Use Soundex
          <input
            name="Soundex"
            type="checkbox"
            checked={this.state.isSoundexActivated}
            onChange={this.handleInputChange}
          />
        </label>
      </form>
    );
  }
}
