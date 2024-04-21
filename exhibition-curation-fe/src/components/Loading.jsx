import { Fragment } from "react";
import loadingGif from "../assets/loadingGif.gif";

const Loading = ({ errMsg }) => {
  return (
    <Fragment key={"loadingErrMsg"}>
      <div className="loadingErr">
        <img alt="loading results" src={loadingGif} width="250" />
        {errMsg !== "" && (
          <div className="errMsg">
            <p>Filtering out some results...</p>
            <p>
              <em>{errMsg}</em>
            </p>
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default Loading