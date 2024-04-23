import { Fragment } from "react";

const Title = ({viewCol}) => {
  return (
    <Fragment key={"titleCard"}>
      <div className="titleCard">
        <h1>Artwork & Artifacts Explorer</h1>
      </div>
      <div className="subheadingCard">
        {!viewCol ? (
          <div>
          <h3>
            Enjoy discovering countless treasures! 
            </h3>
            <h4>Curate an exhibition of your favourite finds</h4>
          <p>Results are sourced from the Art Institute of Chicago and
              Metropolitan Museum NYC</p>
            </div>
        ) : (
          <h4>
            Your personal collection curated this session
          </h4>
        )}
      </div>
    </Fragment>
  );
};

export default Title;