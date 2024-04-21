import { Fragment } from "react";

const ResultsCounter = ({ lastSearch, total }) => {
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
        <div className="resultsFound">
          <p>
            <em>Showing {total} results!</em>
          </p>
        </div>
      </Fragment>
    );
}

export default ResultsCounter;