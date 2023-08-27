import React from "react";
import ReactDOM from "react-dom/client";
// import App from './App.jsx'
// import './index.css'
import StarRating from "./StarRating.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StarRating
      maxRating={5}
      size={24}
      color={"orange"}
      messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
      defaultRating={0}
    />
    <StarRating maxRating={15} size={48} color={"blue"} />

    {/* <App/> */}
  </React.StrictMode>
);
