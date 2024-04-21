import { Fragment, useContext } from "react";
import { UserColContext } from "./App";
import { CollectionContext } from "./App";

const Collection = () => {
  const [userCol, setUserCol] = useContext(UserColContext);
  const [viewCol, setViewCol] = useContext(CollectionContext);

    const handleCollection = () => {
      setViewCol(!viewCol);
    };

    return (
      userCol.length === 0 && (
        <Fragment key={"colNoResults"}>
          <div className="colNoRes">
            <p className="nothingHere">
              <em>Nothing here yet...</em>
            </p>
            <p className="returnSearch">
              Return to search and add your favourite results
            </p>
          </div>
          <button onClick={handleCollection}>Return to Search</button>
        </Fragment>
      )
    );
}

export default Collection