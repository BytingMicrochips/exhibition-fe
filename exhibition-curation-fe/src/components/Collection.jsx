import { Fragment, useContext} from "react";
import { UserColContext } from "./App";
import { CollectionContext } from "./App";

const Collection = () => {
  const [userCol, setUserCol] = useContext(UserColContext);
  const [viewCol, setViewCol] = useContext(CollectionContext);
    
    const handleCollection = () => {
      setViewCol(!viewCol);
    };

    const fetchDetails = async (id, api) => {
        console.log('fetching', id, 'from', api)
        const chicSingleArt = `https://api.artic.edu/api/v1/artworks/`;
        const metSingleArt = `https://collectionapi.metmuseum.org/public/collection/v1/objects/`;

        if (api === "chicago") {
            const fullDetails = await fetch(chicSingleArt + id, {mode: "cors"});
            fullDetails
              .json()
              .then((jsonResponse) => {
                  const index = userCol.findIndex(
                      (item) => item.id === id && item.api === "chicago"
                  );
                  userCol[index].fullDetails = jsonResponse;
              })
            
        }
        if (api === "met") {
            const fullDetails = await fetch(metSingleArt + id, { mode: "cors" });
            fullDetails
              .json()
              .then((jsonResponse) => {
                  const index = userCol.findIndex(
                      (item) => item.id === id && item.api === "met"
                  );
                 userCol[index].fullDetails = jsonResponse;
        })
        }
    }

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
            {userCol.forEach((artwork) => {
                if (artwork.fullDetails === null) {
                    fetchDetails(artwork.id, artwork.api)
                }
            })}
      </Fragment>
    );
}

export default Collection