import { Fragment } from "react";
import expand from "../assets/expand.png";
import expandArrow from "../assets/expandArrow.png";
import collapseArrow from "../assets/collapseArrow.png";
import smallLoadingGif from "../assets/smallLoadingGif.gif";
import { useContext } from "react";
import { ModalContext, IsSelectedContext, ModalPropsContext } from "../components/App";

const ResultsMapMet = ({ results, detailsLoading, fullDetails }) => {
  const [modal, setModal] = useContext(ModalContext);
  const [modalProps, setModalProps] = useContext(ModalPropsContext);
  const [isSelected, setIsSelected] = useContext(IsSelectedContext);

  const handleExpanded = (id) => {
    id === isSelected ? setIsSelected("") : setIsSelected(id);
  };

  const handleModal = (medium, src) => {
    setModalProps({ medium, src });
    setModal(!modal);
  };

  return results.map((artwork) => {
    return (
      <Fragment key={artwork.objectID}>
        <div className="artworkCard">
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
                  alt="expand for details"
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
            <img
              alt={artwork.medium}
              src={artwork.primaryImageSmall}
              width="200"
            />
            <button
              className="expandImg"
              onClick={() => {
                handleModal(artwork.medium, artwork.primaryImageSmall);
              }}
            >
              <img id="expandIcon" src={expand} alt="expand image" />
            </button>
          </div>
        </div>
        {detailsLoading === true && isSelected === artwork.objectID && (
          <>
            <div className="fullDetails">
              <button onClick={() => handleExpanded(artwork.objectID)}>
                <img src={smallLoadingGif} alt="loading details" />
              </button>
            </div>
          </>
        )}
        {detailsLoading === false && isSelected === artwork.objectID && (
          <>
            <div className="fullDetails">
              <button onClick={() => handleExpanded(artwork.objectID)}>
                {artwork.artistDisplayName ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <p className="artistDetails">
                      <em>
                        Unidentified artist,{" "}
                        {fullDetails.culture ||
                          fullDetails.country ||
                          ` department of ${fullDetails.department}`}
                      </em>
                    </p>
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
          </>
        )}
      </Fragment>
    );
  });
};

export default ResultsMapMet;