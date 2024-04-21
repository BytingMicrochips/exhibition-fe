import { Fragment } from "react";
import expand from "../assets/expand.png";
import expandArrow from "../assets/expandArrow.png";
import collapseArrow from "../assets/collapseArrow.png";
import smallLoadingGif from "../assets/smallLoadingGif.gif";
import { useContext } from "react";
import { ModalContext, IsSelectedContext, ModalPropsContext, UserColContext } from "./App";
import DOMPurify from "dompurify";

const ResultsMapChic = (props) => {
  const [modal, setModal] = useContext(ModalContext);
  const [modalProps, setModalProps] = useContext(ModalPropsContext);
  const [selected, setSelected] = useContext(IsSelectedContext);
  const [userCol, setUserCol] = useContext(UserColContext);
  const handleModal = (config, id, altText) => {
    setModalProps({ config, id, altText });
    setModal(!modal);
  };

  const handleExpanded = (id) => {
    id === selected ? setSelected("") : setSelected(id);
  };

  const handleCol = (id) => {
    const currentCol = [...userCol]
    const match = currentCol.findIndex((item) => item.id === id)
    if (match != -1) {
      currentCol.splice(match, 1);
      setUserCol(currentCol);
    } else {
      typeof props.fullDetails.data !== "undefined" && props.fullDetails.data.id === id ? 
        currentCol.push({ id, api: "chicago", fullDetails: props.fullDetails }) 
        :
        currentCol.push({ id, api: "chicago", fullDetails: null });
      setUserCol(currentCol);
    }
  }

  return (
    <>
      {props.results.data.map((artwork) => {
        if (artwork.thumbnail) {
          return (
            <Fragment key={artwork.id}>
              <div className="artworkCard">
                <button
                  className="artworkButton"
                  onClick={() => handleExpanded(artwork.id)}
                >
                  <div id="headingArrow">
                    <div className="artworkCardHeader">
                      <p>{artwork.title}</p>
                    </div>
                    {props.isSelected === artwork.id ? (
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
                  <div className="centeredImg">
                    <img
                      alt={artwork.thumbnail.alt_text}
                      src={`${props.results.config.iiif_url}/${artwork.image_id}/full/400,/0/default.jpg`}
                      width="200"
                    />
                  </div>
                </div>
              </div>
              <button
                className="expandImg"
                onClick={() =>
                  handleModal(
                    props.results.config.iiif_url,
                    artwork.image_id,
                    artwork.thumbnail.alt_text
                  )
                }
              >
                <img id="expandIcon" src={expand} alt="expand image" />
              </button>
              {userCol.findIndex((item) => item.id === artwork.id) === -1 ? (
                <button onClick={() => handleCol(artwork.id)}>
                  Add to collection
                </button>
              ) : (
                <button onClick={() => handleCol(artwork.id)}>
                  Remove from collection
                </button>
              )}

              {props.detailsLoading === true &&
              props.isSelected === artwork.id ? (
                <>
                  <div className="fullDetails">
                    <button onClick={() => handleExpanded(artwork.id)}>
                      <img
                        id="smallLoadingGif"
                        src={smallLoadingGif}
                        alt="details loading"
                      />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {props.fullDetails.length != 0 &&
                    props.isSelected === artwork.id && (
                      <div className="fullDetails">
                        <button onClick={() => handleExpanded(artwork.id)}>
                          {props.isSelected === artwork.id && (
                            <>
                              <div className="detailHeadings">
                                <p className="artistDetails">
                                  <em>
                                    {props.fullDetails.data.artist_title ||
                                      "Unidentified artist"}
                                  </em>
                                </p>
                                <div className="mediumDate">
                                  <p>
                                    {props.fullDetails.data.date_display ||
                                      props.fullDetails.data.date_end ||
                                      props.fullDetails.data.date_start}
                                  </p>
                                  <p>
                                    {props.fullDetails.data.medium_display ||
                                      props.fullDetails.data
                                        .artwork_type_title ||
                                      props.fullDetails.data
                                        .classification_title}
                                  </p>
                                </div>
                                {props.fullDetails.data.place_of_origin !=
                                  null && (
                                  <>
                                    <p>
                                      Produced in{" "}
                                      {props.fullDetails.data.place_of_origin}
                                    </p>
                                  </>
                                )}

                                {props.fullDetails.data.credit_line && (
                                  <>
                                    <div className="creditLine">
                                      <p>
                                        {props.fullDetails.data.credit_line}
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>

                              {props.description !== "" && (
                                <>
                                  <div
                                    className="detailDescr"
                                    dangerouslySetInnerHTML={{
                                      __html: DOMPurify.sanitize(
                                        props.description,
                                        {
                                          FORBID_ATTR: ["href"],
                                        }
                                      ),
                                    }}
                                  />
                                </>
                              )}
                            </>
                          )}
                          <div className="viewAt">
                            {props.fullDetails.data.is_on_view ? (
                              props.fullDetails.data.gallery_title ? (
                                <p>
                                  On view at Art Institute of Chicago,{" "}
                                  {props.fullDetails.data.gallery_title}
                                </p>
                              ) : (
                                <p>On view at Art Institute of Chicago</p>
                              )
                            ) : (
                              <p>
                                Stored at Art Institute of Chicago - not on view
                              </p>
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
              )}
            </Fragment>
          );
        }
      })}
    </>
  );
};

export default ResultsMapChic;