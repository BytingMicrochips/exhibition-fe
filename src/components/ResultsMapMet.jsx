import { Fragment, useState } from "react";
import expand from "../assets/expand.png";
import expandArrow from "../assets/expandArrow.png";
import collapseArrow from "../assets/collapseArrow.png";
import smallLoadingGif from "../assets/smallLoadingGif.gif";
import { useContext } from "react";
import {
  ModalContext,
  IsSelectedContext,
  ModalPropsContext,
  UserColContext,
} from "./App";
import whiteHeart from "../assets/whiteHeart.png";
import blackHeart from "../assets/blackHeart.png";

const ResultsMapMet = ({ results, detailsLoading, fullDetails }) => {
  const [modal, setModal] = useContext(ModalContext);
  const [modalProps, setModalProps] = useContext(ModalPropsContext);
  const [isSelected, setIsSelected] = useContext(IsSelectedContext);
  const [userCol, setUserCol] = useContext(UserColContext);
  const [errorMsg, setErrorMsg] = useState("");

  const handleExpanded = (id) => {
    id === isSelected ? setIsSelected("") : setIsSelected(id);
  };

  const handleModal = (medium, src) => {
    setModalProps({ medium, src });
    setModal(!modal);
  };

  const handleCol = (id) => {
    const currentCol = [...userCol];
    const match = currentCol.findIndex(
      (item) => item.id === id && item.api === "met"
    );
    if (match != -1) {
      currentCol.splice(match, 1);
      setUserCol(currentCol);
    } else {
      fullDetails.objectID === id
        ? currentCol.push({
            id,
            api: "met",
            fullDetails: fullDetails,
          })
        : fetchDetails(id, "met");
    }
    setUserCol(currentCol);
  };

  const fetchDetails = async (id, api) => {
    setErrorMsg("");
    const metSingleArt = `https://collectionapi.metmuseum.org/public/collection/v1/objects/`;
    const currentCol = [...userCol];
    const fullDetails = await fetch(metSingleArt + id, { mode: "cors" });
    fullDetails
      .json()
      .then((jsonResponse) => {
        currentCol.push({
          id,
          api: "met",
          fullDetails: jsonResponse,
        });
        setUserCol(currentCol);
      })
      .catch((err) => {
        setErrorMsg(err.msg);
      });
  };

  return (
    <Fragment key={"ResultsMapMet"}>
      {errorMsg !== "" && (
        <Fragment key={"colError"}>
          <div className="colError">
            <p>
              <em>Failed to add an item to your collection!</em>
            </p>
          </div>
        </Fragment>
      )}
      {results.map((artwork) => {
        return (
          <Fragment key={artwork.objectID}>
            <div key={artwork.objectID + "artworkCard"} className="artworkCard">
              <button
                className="artworkButton"
                onClick={() => handleExpanded(artwork.objectID)}
              >
                <div id="headingArrow">
                  <div className="artworkCardHeader">
                    <p>{artwork.title || "Untitled"}</p>
                  </div>
                  {isSelected === artwork.objectID ? (
                    <img
                      className="expColButton"
                      alt="hide details"
                      src={collapseArrow}
                    />
                  ) : (
                    <img
                      className="expColButton"
                      alt="expand for details"
                      src={expandArrow}
                    />
                  )}
                </div>
              </button>
              <div className="artworkCardImg">
                <div className="centeredImg">
                  <img
                    alt={artwork.medium}
                    src={artwork.primaryImageSmall}
                    width="200"
                  />
                </div>

                <button
                  className="expandImg"
                  onClick={() => {
                    handleModal(artwork.medium, artwork.primaryImageSmall);
                  }}
                >
                  <img id="expandIcon" src={expand} alt="expand image" />
                </button>
                {userCol.findIndex(
                  (item) => item.id === artwork.objectID && item.api === "met"
                ) === -1 ? (
                  <button
                    aria-label="add to my collection"
                    className="addRemoveCol"
                    onClick={() => handleCol(artwork.objectID)}
                  >
                    <img id="heart" alt="like button" src={blackHeart} />
                  </button>
                ) : (
                  <button
                    aria-label="remove from my collection"
                    className="addRemoveCol"
                    onClick={() => handleCol(artwork.objectID)}
                  >
                    <img id="heart" alt="unlike button" src={whiteHeart} />
                  </button>
                )}
              </div>
            </div>

            {detailsLoading === true && isSelected === artwork.objectID && (
              <Fragment key={`fullDetails${artwork.objectID}Loading`}>
                <div className="fullDetails">
                  <button onClick={() => handleExpanded(artwork.objectID)}>
                    <img
                      id="smallLoadingGif"
                      src={smallLoadingGif}
                      alt="loading details"
                    />
                  </button>
                </div>
              </Fragment>
            )}
            {detailsLoading === false && isSelected === artwork.objectID && (
              <Fragment key={`fullDetails${artwork.objectID}`}>
                <div className="fullDetails">
                  <button onClick={() => handleExpanded(artwork.objectID)}>
                    {artwork.artistDisplayName ? (
                      <>
                        <div className="detailHeadings">
                          <div className="artistDetails">
                            <p>
                              <em>
                                {fullDetails.artistDisplayName}
                                {fullDetails.artistRole &&
                                  `, ${fullDetails.artistRole}, `}
                              </em>
                            </p>
                            <em>
                              {fullDetails.culture ||
                                fullDetails.country ||
                                ` department of ${fullDetails.department}`}
                            </em>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="detailHeadings">
                          <p className="artistDetails">Unidentified artist</p>
                          <p>
                            <em>
                              {" "}
                              {fullDetails.culture ||
                                fullDetails.country ||
                                ` department of ${fullDetails.department}`}
                            </em>
                          </p>
                        </div>
                      </>
                    )}
                    <div className="mediumDate">
                      {fullDetails.medium && <p>{fullDetails.medium}</p>}
                      <p>
                        {fullDetails.objectDate
                          ? fullDetails.objectDate
                          : fullDetails.objectEndDate ||
                            fullDetails.objectBeginDate ||
                            fullDetails.excavation ||
                            fullDetails.period}
                      </p>
                    </div>
                    {fullDetails.creditLine && (
                      <p className="creditLine">{fullDetails.creditLine}</p>
                    )}
                    {fullDetails.repository && (
                      <>
                        <div className="viewAt">
                          <p>
                            {fullDetails.GalleryNumber != ""
                              ? `On view at ${fullDetails.repository}, gallery ${fullDetails.GalleryNumber}`
                              : `Stored at ${fullDetails.repository} - not on
                                view`}
                          </p>
                        </div>
                      </>
                    )}
                    {fullDetails.objectURL != "" ? (
                      <a
                        className="moreInfo"
                        href={fullDetails.objectURL}
                        target="_blank"
                      >
                        More info
                      </a>
                    ) : fullDetails.objectWikidata_URL != "" ? (
                      <a
                        className="moreInfo"
                        href={fullDetails.objectWikidata_URL}
                        target="_blank"
                      >
                        More info
                      </a>
                    ) : (
                      fullDetails.linkResource != "" && (
                        <a
                          className="moreInfo"
                          href={fullDetails.linkResource}
                          target="_blank"
                        >
                          More info
                        </a>
                      )
                    )}
                    <img
                      className="expColButton"
                      alt="expand for details"
                      src={collapseArrow}
                    />
                  </button>
                </div>
              </Fragment>
            )}
          </Fragment>
        );
      })}
    </Fragment>
  );
};

export default ResultsMapMet;
