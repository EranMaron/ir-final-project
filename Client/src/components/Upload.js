import React, { Component } from "react";
import axios from "axios";

export default class Upload extends Component {
  state = {
    selectedFile: null
  };

  fileSelectedHandler = uploadedFile => {
    this.setState({ selectedFile: uploadedFile.target.files[0] });
  };

  fileUploadeHanled = e => {
    e.preventDefault();

    const data = new FormData();
    data.append("file", this.state.selectedFile);

    console.log(this.state.selectedFile);

    axios
      .post(`http://localhost:3000/upload`, data)
      .then(res => res.json())
      .then(data => console.log(data));
  };

  render() {
    return (
      <div className="ui container">
        <form className="ui form" onSubmit={this.fileUploadeHanled}>
          <div className="field">
            <input id="input" type="file" onChange={this.fileSelectedHandler} />
            <button className="ui button">Upload</button>
          </div>
        </form>
      </div>
    );
  }
}
