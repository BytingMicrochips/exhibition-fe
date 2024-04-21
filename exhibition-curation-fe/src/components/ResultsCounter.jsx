import { Fragment } from "react";

const ResultsCounter = ({ lastSearch, total, errMsg }) => {
    return total === 0 ? (
      <Fragment key={"resultsCounter"}>
        <div className="resultsFound">
          <p>
            <em>No results currently archived about: {lastSearch}</em>
          </p>
        </div>
      </Fragment>
    ) : (
        <Fragment key={"resultsCounter"}>
          <div className="resultsFoundErr">
        <div className="resultsFound">
          <p>
            <em>Showing {total} results!</em>
          </p>
        </div>
          {errMsg !== "" && (
            <div className="resultsErr">
              <p>
                <em>Results filtered due to incompatible responses</em>
              </p>
            </div>
          )}
        </div>
      </Fragment>
    );
}

export default ResultsCounter;