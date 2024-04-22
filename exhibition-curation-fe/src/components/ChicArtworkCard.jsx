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
import DOMPurify from "dompurify";


const ChicArtworkCard = ({ id, fullDetails, detailsLoading, description }) => {
  const [isSelected, setIsSelected] = useState("");
  const [userCol, setUserCol] = useContext(UserColContext);
  const [modal, setModal] = useContext(ModalContext);
  const [modalProps, setModalProps] = useContext(ModalPropsContext);

    const handleExpanded = (id) => {
        isSelected === id ? setIsSelected("") : setIsSelected(id);
    };

    const handleCol = (id) => {
        const currentCol = [...userCol]
        const match = currentCol.findIndex(
            (item) => item.id === id && item.api === "chicago"
        );
        currentCol.splice(match, 1);
        setUserCol(currentCol);
    };

  const handleModal = (config, id, altText) => {
    setModalProps({ config, id, altText });
    setModal(!modal);
  };
    
return (
      <Fragment key={id}>
        <div key={id + "artworkCard"} className="artworkCard">
          <button className="artworkButton" onClick={() => handleExpanded(id)}>
            <div id="headingArrow">
              <div className="artworkCardHeader">
                <p>{fullDetails.data.title}</p>
              </div>
              {isSelected === id ? (
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
                alt={fullDetails.data.thumbnail.alt_text}
                src={`${fullDetails.config.iiif_url}/${fullDetails.data.image_id}/full/400,/0/default.jpg`}
                width="200"
              />
            </div>
            <button
              className="expandImg"
              onClick={() =>
                handleModal(
                  fullDetails.config.iiif_url,
                  fullDetails.data.image_id,
                  fullDetails.data.thumbnail.alt_text
                )
              }
            >
              <img id="expandIcon" src={expand} alt="expand image" />
            </button>
            <button
              aria-label="remove from my collection"
              className="addRemoveCol"
              onClick={() => handleCol(id)}
            >
              <img id="heart" alt="unlike button" src={whiteHeart} />
            </button>
          </div>
        </div>

        {isSelected === id &&       
            (
            <>
              {fullDetails.length != 0 && isSelected === id && (
                <div className="fullDetails">
                  <button onClick={() => handleExpanded(id)}>
                    {isSelected === id && (
                      <>
                        <div className="detailHeadings">
                          <p className="artistDetails">
                            <em>
                              {fullDetails.data.artist_title ||
                                "Unidentified artist"}
                            </em>
                          </p>
                          <div className="mediumDate">
                            <p>
                              {fullDetails.data.date_display ||
                                fullDetails.data.date_end ||
                                fullDetails.data.date_start}
                            </p>
                            <p>
                              {fullDetails.data.medium_display ||
                                fullDetails.data.artwork_type_title ||
                                fullDetails.data.classification_title}
                            </p>
                          </div>
                          {fullDetails.data.place_of_origin != null && (
                            <>
                              <p>
                                Produced in {fullDetails.data.place_of_origin}
                              </p>
                            </>
                          )}

                          {fullDetails.data.credit_line && (
                            <>
                              <div className="creditLine">
                                <p>{fullDetails.data.credit_line}</p>
                              </div>
                            </>
                          )}
                        </div>

                        {description !== "" && (
                          <>
                            <div
                              className="detailDescr"
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(description, {
                                  FORBID_ATTR: ["href"],
                                }),
                              }}
                            />
                          </>
                        )}
                      </>
                    )}
                    <div className="viewAt">
                      {fullDetails.data.is_on_view ? (
                        fullDetails.data.gallery_title ? (
                          <p>
                            On view at Art Institute of Chicago,{" "}
                            {fullDetails.data.gallery_title}
                          </p>
                        ) : (
                          <p>On view at Art Institute of Chicago</p>
                        )
                      ) : (
                        <p>Stored at Art Institute of Chicago - not on view</p>
                      )}
                    </div>
                    <img
                      className="expColButton"
                      alt="expand for details"
                      src={collapseArrow}
                    />
                  </button>
                </div>
              )}
            </>
          )
        }
      </Fragment>
);
}

export default ChicArtworkCard;