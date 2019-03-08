import React from "react";
import { Route } from "react-router-dom";
import NavBar from "../components/NavBar";
import Upload from "../components/Upload";
import Search from "../components/Search";

const ReactRouter = () => {
  return (
    <div className="ui container" style={{ marginTop: "30px" }}>
      <React.Fragment>
        <NavBar />
        <Route exact path="/" component={Search} />
        <Route path="/upload" component={Upload} />
      </React.Fragment>
    </div>
  );
};

export default ReactRouter;
