import { Fragment } from "react";
import loadingGif from "../assets/loadingGif.gif";

const Loading = ({ errMsg, errCounter }) => {
  return (
    <Fragment key={"loadingErrMsg"}>
      <div className="loadingErr">
        <img alt="loading results" src={loadingGif} width="250" />
        {errCounter !== 0 && (
          <div className="errMsg">
            <p>Filtered out {errCounter} results...</p>
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