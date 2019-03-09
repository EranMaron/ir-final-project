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

  fileDeactivateHandler = e => {
    e.preventDefault();

    axios
      .post(`http://localhost:3000/deactivateFile`, {
        fileNumber: this.fileNumber.value
      })
      .then(response => console.log(response));
  };

  fileActivateHandler = e => {
    e.preventDefault();

    axios
      .post(`http://localhost:3000/activateFile`, {
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
        <form className="ui form" onSubmit={this.fileDeactivateHandler}>
          <input
            id="deactivate"
            type="text"
            placeholder="file number to deactivate"
            ref={input => (this.fileNumber = input)}
          />
          <button className="ui button">deActivate</button>
        </form>
        <form className="ui form" onSubmit={this.fileActivateHandler}>
          <input
            id="activate"
            type="text"
            placeholder="file number to activate"
            ref={input => (this.fileNumber = input)}
          />
          <button className="ui button">Activate</button>
        </form>
      </div>
    );
  }
}
