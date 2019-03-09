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

    axios
      .post(`http://localhost:3000/upload`, data)
      .then(response => console.log(response));
  };

  fileDeleteHandler = e => {
    e.preventDefault();

    axios
      .post(`http://localhost:3000/deleteFile`, {
        fileNumber: this.fileNumber.value
      })
      .then(response => console.log(response));
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
        <form className="ui form" onSubmit={this.fileDeleteHandler}>
          <input
            id="delete"
            type="text"
            placeholder="file number to delete"
            ref={input => (this.fileNumber = input)}
          />
          <button className="ui button">Delete</button>
        </form>
      </div>
    );
  }
}
