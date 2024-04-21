import { Fragment, useContext } from "react";
import { CollectionContext } from "./App";

const Navigation = () => {
    const [viewCol, setViewCol] = useContext(CollectionContext);

    const handleCollection = () => {
        setViewCol(!viewCol);
    }

    return (
      <Fragment key={"navigationFrag"}>
        <div className="navigation">
          {viewCol ? (
            <button onClick={handleCollection}>New Search</button>
          ) : (
            <button onClick={handleCollection}>My collection</button>
          )}
        </div>
      </Fragment>
    );
}

export default Navigation;