import { Fragment, useContext, useEffect, useState} from "react";
import { UserColContext } from "./App";
import { CollectionContext } from "./App";
import ChicArtworkCard from "./ChicArtworkCard";

const Collection = () => {
  const [userCol, setUserCol] = useContext(UserColContext);
  const [viewCol, setViewCol] = useContext(CollectionContext);
  const [errorMsg, setErrorMsg] = useState("");

    const handleCollection = () => {
      setViewCol(!viewCol);
    };

    useEffect(() => {
        userCol.forEach((artwork) => {
            if (artwork.fullDetails === null) {
                fetchDetails(artwork.id, artwork.api);
                }
            });
    },[])

    return (
      <Fragment key={"collectionComp"}>
        {userCol.length === 0 && (
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
        )}
        {errorMsg !== "" && (
          <Fragment>
            <div className="errShow">
                    <p>Problems occurred loading your collection</p>
                    <p><em>{errorMsg}</em></p>
            </div>
          </Fragment>
            )}
        {userCol.map((artwork) => {
            return (
              <Fragment key={artwork.id+artwork.api}>
                <ChicArtworkCard
                  id={artwork.id}
                  fullDetails={artwork.fullDetails}
                  description={artwork.fullDetails.description}
                />
              </Fragment>
            );
        })
        }
            
      </Fragment>
    );
}

export default Collection