import { Fragment, useState } from "react";
import expand from "../assets/expand.png";
import expandArrow from "../assets/expandArrow.png";
import collapseArrow from "../assets/collapseArrow.png";
import whiteHeart from "../assets/whiteHeart.png";
import { useContext } from "react";
import {
  ModalContext,
  ModalPropsContext,
  UserColContext,
} from "./App";

const MetArtworkCard = ({ artwork }) => {
  const [isSelected, setIsSelected] = useState("");
  const [modal, setModal] = useContext(ModalContext);
  const [modalProps, setModalProps] = useContext(ModalPropsContext);
  const [userCol, setUserCol] = useContext(UserColContext);

  const handleExpanded = (id) => {
    isSelected === id ? setIsSelected("") : setIsSelected(id); 
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
    currentCol.splice(match, 1);
    setUserCol(currentCol);
  };


    return (
      <Fragment key={artwork.objectID+'m'}>
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
            <button
              aria-label="remove from my collection"
              className="addRemoveCol"
              onClick={() => handleCol(artwork.objectID)}
            >
              <img id="heart" alt="unlike button" src={whiteHeart} />
            </button>
          </div>
        </div>
        {isSelected === artwork.objectID && (
          <Fragment key={"fullDetails" + artwork.objectID}>
            <div className="fullDetails">
              <button onClick={() => handleExpanded(artwork.objectID)}>
                {artwork.artistDisplayName ? (
                  <Fragment key={"artistDetailsM" + artwork.objectID}>
                    <div className="artistDetails">
                      <div className="detailHeadings">
                        <p>
                          <em>
                            {artwork.artistDisplayName}
                            {artwork.artistRole && `, ${artwork.artistRole}, `}
                          </em>
                        </p>
                      </div>
                      <em>
                        {artwork.culture ||
                          artwork.country ||
                          ` department of ${artwork.department}`}
                      </em>
                    </div>
                  </Fragment>
                ) : (
                  <Fragment key={"unidentifiedArtM" + artwork.objectID}>
                    <div className="detailHeadings">
                      <p className="artistDetails">
                        <em>
                          Unidentified artist,{" "}
                          {artwork.culture ||
                            artwork.country ||
                            ` department of ${artwork.department}`}
                        </em>
                      </p>
                    </div>
                  </Fragment>
                )}
                <div className="mediumDate">
                  {artwork.medium && <p>{artwork.medium}</p>}
                  <p>
                    {artwork.objectDate
                      ? artwork.objectDate
                      : artwork.objectEndDate ||
                        artwork.objectBeginDate ||
                        artwork.excavation ||
                        artwork.period}
                  </p>
                </div>
                {artwork.creditLine && (
                  <p className="creditLine">{artwork.creditLine}</p>
                )}
                {artwork.repository && (
                  <Fragment key={"viewAtM" + artwork.objectID}>
                    <div className="viewAt">
                      <p>
                        {artwork.GalleryNumber != ""
                          ? `On view at ${artwork.repository}, gallery ${artwork.GalleryNumber}`
                          : `Stored at ${artwork.repository} - not on
                                    view`}
                      </p>
                    </div>
                  </Fragment>
                )}
                {artwork.objectURL != "" ? (
                  <a
                    className="moreInfo"
                    href={artwork.objectURL}
                    target="_blank"
                  >
                    More info
                  </a>
                ) : artwork.objectWikidata_URL != "" ? (
                  <a
                    className="moreInfo"
                    href={artwork.objectWikidata_URL}
                    target="_blank"
                  >
                    More info
                  </a>
                ) : (
                  artwork.linkResource != "" && (
                    <a
                      className="moreInfo"
                      href={artwork.linkResource}
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
}

export default MetArtworkCard;