import { Fragment } from "react";

const Title = () => {
    return (
      <Fragment key={"titleCard"}>
        <div className="titleCard">
          <h1>Artwork & artifacts explorer</h1>
        </div>
        <div className="subheadingCard">
          <p>
            Results are sourced from the Art Institute of Chicago and
            Metropolitan Museum NYC collections
          </p>
        </div>
      </Fragment>
    );
}

export default Title;