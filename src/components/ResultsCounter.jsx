import { Fragment } from "react";

const ResultsCounter = ({ lastSearch, total, errMsg, errCounter}) => {
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
              <em>Showing {total} results</em>
            </p>
          </div>
          {errCounter !== 0 && (
            <div className="resultsErr">
              <p>
                {errCounter === 1 ? (
                  <em>{errCounter} incompatible result skipped</em>
                ) : (
                  <em>{errCounter} incompatible results skipped</em>
                )}
              </p>
            </div>
          )}
        </div>
      </Fragment>
    );
}

export default ResultsCounter;