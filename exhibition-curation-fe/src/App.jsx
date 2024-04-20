import { useState, useEffect } from "react";
import "./App.css";
import loadingGif from "./assets/loadingGif.gif";
import smallLoadingGif from "./assets/smallLoadingGif.gif";
import cube from "./assets/cube.png";
import expand from "./assets/expand.png";
import DOMPurify from "dompurify";
import expandArrow from "./assets/expandArrow.png";
import collapseArrow from "./assets/collapseArrow.png";

function App() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [apiSelector, setApiSelector] = useState(
    "https://api.artic.edu/api/v1/artworks/search?q="
  );
  const [metIdList, setMetIdList] = useState([]);
  const [metTotal, setMetTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [chicagoPage, setChicagoPage] = useState(1);
  const [metIndex, setMetIndex] = useState(0);
  const [metPrevious, setMetPrevious] = useState([]);
  const [loadMetPrev, setLoadMetPrev] = useState(false);
  const [searchMade, setSearchMade] = useState(false);
  const [lastSearch, setLastSearch] = useState("");
  const [fullDetails, setFullDetails] = useState([]);
  const [isSelected, setIsSelected] = useState("");
  const [description, setDescription] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const chicagoArtUrl = `https://api.artic.edu/api/v1/artworks/search?q=`;
  const metMuseumUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=`;
  const [modal, setModal] = useState(false);
  const [modalId, setModalId] = useState("");
  const [modalImgId, setModalImgId] = useState("");
  const [modalAltText, setModalAltText] = useState("");
  const [metModal, setMetModal] = useState({});
  const [thumbLength, setThumbLength] = useState(0);
  const [controlApi, setControlApi] = useState("Art Institute of Chicago");
  const allArtworks = [];
  let counter = 0;
  let loadTen = 0;
  
  const fetchResults = async () => {
    const emptyMet = [];
    setModal(false);
    setIsLoading(true);
    const fullRequest = `${apiSelector}${input}`;

    if (apiSelector === chicagoArtUrl) {
      setMetIdList(emptyMet);
      setMetTotal(0);
      const result = await fetch(
        `${fullRequest}&fields=id,title,thumbnail,image_id&page=${chicagoPage}`
      )
        result.json()
          .then((jsonResponse) => {
          setResults(jsonResponse);
          setIsLoading(false);
          setSearchMade(true);
          })
          .catch(err => {
            console.log(err.message);
        })
      }
    if (apiSelector === metMuseumUrl) {
      const result = await fetch(`${fullRequest}`);
      result.json()
        .then((jsonResponse) => {
        if (jsonResponse.total > 0) {
          setMetIdList(jsonResponse.objectIDs);
          setMetTotal(jsonResponse.total);
        } else {
          setMetIdList(emptyMet);
          setMetTotal(jsonResponse.total);
          setIsLoading(false);
          setSearchMade(true);
        }
        })
        .catch((err) => {
        console.log(err.message)
      })
    }
  };

  useEffect(() => {
    if (metIdList.length > 0) {
      fetchMet(counter);
    } else {
      const emptyResults = [];
      setResults(emptyResults);
    }
  }, [metIdList]);

  useEffect(() => {
    if (input !== "") {
      fetchResults();
    }
  }, [chicagoPage]);

  const fetchMet = async (counter) => {
    setIsLoading(true);
    let currentArtworkId = metIdList[counter];

    if (typeof currentArtworkId === "number" && typeof currentArtworkId !== "undefined") {
      const result = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${currentArtworkId}`
      )
      if (typeof result !== "undefined") {
        result
          .json()
          .then((jsonResponse) => {
            if (
              jsonResponse.primaryImageSmall === ""
            ) {
              counter++;
            } else if (jsonResponse.hasOwnProperty("message")) {
              counter++;
              fetchMet(counter);
              throw Error(`Server says: ${jsonResponse.message}`);
            }
            else {
              allArtworks.push(jsonResponse);
              counter++;
              loadTen++;
              if (!metPrevious.includes(jsonResponse.objectID)) {
                metPrevious.push(jsonResponse.objectID);
              }
            }
          })
          .then(() => {
            if (counter < metIdList.length - 1 && loadTen < 10) {
              fetchMet(counter);
            } else {
              setResults(allArtworks);
              setIsLoading(false);
              setMetIndex(counter);
              loadTen = 0;
            }
          })
          .catch((err) => {
            console.log(err.message);
          });
      }
      }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const handleSearch = (e) => {
    setLastSearch(input);
    setFullDetails([]);
    setIsSelected("");
    if (chicagoPage != 1) {
      setChicagoPage(1);
    } else {
      fetchResults();
    }
  };

  const handleCollection = (e) => {
    if (e.currentTarget.value !== controlApi) {
      if (e.currentTarget.value === "Art Institute of Chicago") {
          setControlApi("Art Institute of Chicago");
          setApiSelector(chicagoArtUrl);
      } else {
        setApiSelector(metMuseumUrl);
          setControlApi("Metropolitan Museum NYC");
      }
    };
    }
  
  const handleNextPageC = () => {
    let currentPage = chicagoPage;
    setChicagoPage(currentPage + 1);
  };

  const handlePrevPageC = () => {
    let currentPage = chicagoPage;
    if (currentPage - 1 > 0) {
      setChicagoPage(currentPage - 1);
    }
  };

  const handleNextPageM = () => {
    const displayIndex = metPrevious.indexOf(results[0].objectID);
    allArtworks.length = 0;
    counter = metIndex;
    if (displayIndex > metPrevious.length - 11) {
      fetchMet(counter);
    } else {
      recallIndex = 0;
      allArtworks.length = 0;
      fetchNextKnown(displayIndex);
    }
  };

  const handlePrevPageM = () => {
    setIsLoading(true);
    setLoadMetPrev(true);
  };

  useEffect(() => {
    if (loadMetPrev === true) {
      allArtworks.length = 0;
      fetchPrevMet();
    }
  }, [loadMetPrev]);

  let recallIndex = 0;
  const fetchPrevMet = async () => {
    const displayIndex = metPrevious.indexOf(results[0].objectID);
    let validId = metPrevious[displayIndex - 10 + recallIndex];

    const result = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${validId}`
    );
    result
      .json()
      .then((jsonResponse) => {
        allArtworks.push(jsonResponse);
        recallIndex++;
      })
      .then(() => {
        if (recallIndex < 10) {
          fetchPrevMet();
        } else {
          setResults(allArtworks);
          setIsLoading(false);
          recallIndex = 0;
          setLoadMetPrev(false);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const fetchNextKnown = async (displayIndex) => {
    setIsLoading(true);
    let validId = metPrevious[displayIndex + 10 + recallIndex];
    const result = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${validId}`
    );
    result
      .json()
      .then((jsonResponse) => {
        allArtworks.push(jsonResponse);
        recallIndex++;
      })
      .then(() => {
        if (recallIndex < 10) {
          fetchNextKnown(displayIndex);
        } else {
          setResults(allArtworks);
          setIsLoading(false);
          recallIndex = 0;
          setLoadMetPrev(false);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    if (apiSelector === metMuseumUrl) {
      setMetPrevious([]);
    }
  }, [input]);

  const handleMetInfo = async (id) => {
    isSelected === id ? setIsSelected("") : setIsSelected(id);
    if (fullDetails.length === 0 || fullDetails.objectID != id) {
      setDetailsLoading(true);
      const metSingleArt = `https://collectionapi.metmuseum.org/public/collection/v1/objects/`;
      const fullDetails = await fetch(metSingleArt + id);
      fullDetails
        .json()
        .then((jsonResponse) => {
          setFullDetails(jsonResponse);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  };

  const handleChicInfo = async (id) => {
    isSelected === id ? setIsSelected("") : setIsSelected(id);
    setDetailsLoading(true);
    if (fullDetails.data && fullDetails.data.id  === id) {
      setDetailsLoading(false);
    } else if (
        fullDetails.length === 0 ||
        fullDetails.objectID ||
        fullDetails.data.id != id
      ) {
        const chicSingleArt = `https://api.artic.edu/api/v1/artworks/`;
        const fullDetails = await fetch(chicSingleArt + id);
        fullDetails
          .json()
          .then((jsonResponse) => {
            setFullDetails(jsonResponse);
          })
          .catch((err) => {
            console.log(err.message);
          });
      }
  };

  useEffect(() => {
    if (apiSelector === chicagoArtUrl) {
      if (fullDetails.data && fullDetails.data.description != null) {
        const extractDisc = fullDetails.data.description;
        setDescription(extractDisc);
        setDetailsLoading(false);
      } else {
        setDescription("");
        setDetailsLoading(false);
      }
    }
    if (apiSelector === metMuseumUrl) {
      setDescription("");
      setDetailsLoading(false);
    }
  }, [fullDetails]);

  const handleFullImg = (id, imgId, altText) => {
    setModal(!modal);
    if (apiSelector === metMuseumUrl) {
      const match = results.filter((item) => {
        return item.objectID === id
      })
      setMetModal(match[0]);
    } else {
    setModalId(id);
    setModalImgId(imgId);
    setModalAltText(altText);
    }
  };

  useEffect(() => {
    if (apiSelector === chicagoArtUrl && results.length !== 0 && results.data) {
      const hasThumbnail = results.data.filter((artwork) => artwork.thumbnail)
      setThumbLength(hasThumbnail.length)
    }
  }, [results])
  
  return modal ? (
    apiSelector === chicagoArtUrl ? (
      <>
        <div className="modal" onClick={handleFullImg}>
          <div className="overlay">
            <div className="modalContent">
              <img
                className="modalImg"
                alt={modalAltText}
                src={`https://www.artic.edu/iiif/2/${modalImgId}/full/400,/0/default.jpg`}
              />
              <p>
                <em>Touch anywhere to close</em>
              </p>
            </div>
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="modal" onClick={handleFullImg}>
          <div className="overlay">
            <div className="modalContent">
              <img
                className="modalImg"
                alt={metModal.medium}
                src={metModal.primaryImageSmall}
              />
              <p>
                <em>Touch anywhere to close</em>
              </p>
            </div>
          </div>
        </div>
      </>
    )
  ) : (
    <>
      <div className="titleCard">
        <h1>Artwork & artifacts explorer</h1>
      </div>
      <div className="subheadingCard">
        <p>
          Results are sourced from the Art Institute of Chicago and Metropolitan
          Museum NYC collections
        </p>
      </div>
      <div>
        <div className="searchCard">
          <h3>Input search criteria:</h3>
          <div className="inputSelect">
            <input onChange={handleInput}></input>
            <select value={controlApi} onChange={handleCollection}>
              <option>Art Institute of Chicago</option>
              <option>Metropolitan Museum NYC</option>
            </select>
          </div>
          <div className="searchButton">
            <button onClick={handleSearch}>Search collections!</button>
          </div>
        </div>
        {isLoading && (
          <>
            <img alt="loading results" src={loadingGif} width="250" />
          </>
        )}

        {metIdList.length > 0 && isLoading === false && (
          <>
            <div className="resultsFound">
              <p>
                <em>Showing {results.length} results!</em>
              </p>
            </div>
          </>
        )}

        {results.data ? (
          results.pagination.total === 0 && isLoading === false ? (
            <>
              <p>
                <em>No results currently archived about: {lastSearch}</em>
              </p>
            </>
          ) : (
            <>
              <div className="resultsFound">
                <p>
                  <em>Showing {thumbLength} results!</em>
                </p>
              </div>

              <div className="prevNextButtons">
                {chicagoPage === 1 ? (
                  <>
                    <button id="hidden" onClick={handlePrevPageC}>
                      Last results
                    </button>
                    <img
                      id="paginationLoading"
                      src={cube}
                      alt="results loaded"
                    />
                  </>
                ) : (
                  <>
                    <button onClick={handlePrevPageC}>Last results</button>
                    {isLoading ? (
                      <img
                        id="paginationLoading"
                        src={smallLoadingGif}
                        alt="results loading"
                      />
                    ) : (
                      <img
                        id="paginationLoading"
                        src={cube}
                        alt="results loaded"
                      />
                    )}
                  </>
                )}
                {results.data.length > 9 ? (
                  <>
                    <button onClick={handleNextPageC}>Next results</button>
                  </>
                ) : (
                  <>
                    <button id="hidden" onClick={handleNextPageC}>
                      Next results
                    </button>
                  </>
                )}
              </div>
              {results.data.map((artwork) => {
                if (artwork.thumbnail) {
                  return (
                    <>
                      <div key={artwork.id} className="artworkCard">
                        <button
                          className="artworkButton"
                          onClick={() => handleChicInfo(artwork.id)}
                        >
                          <div id="headingArrow">
                            <div className="artworkCardHeader">
                              <p>{artwork.title}</p>
                            </div>
                            {isSelected === artwork.id ? (
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
                              src={`${results.config.iiif_url}/${artwork.image_id}/full/400,/0/default.jpg`}
                              width="200"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        key={`${artwork.id}ExpandButton`}
                        className="expandImg"
                        onClick={() => {
                          handleFullImg(
                            artwork.id,
                            artwork.image_id,
                            artwork.thumbnail.alt_text
                          );
                        }}
                      >
                        <img id="expandIcon" src={expand} alt="expand image" />
                      </button>

                      {detailsLoading === true && isSelected === artwork.id ? (
                        <>
                          <div className="fullDetails">
                            <button onClick={() => handleChicInfo(artwork.id)}>
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
                          {fullDetails.length != 0 &&
                            isSelected === artwork.id && (
                              <div className="fullDetails">
                                <button
                                  onClick={() => handleChicInfo(artwork.id)}
                                >
                                  {isSelected === artwork.id && (
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
                                              fullDetails.data
                                                .artwork_type_title ||
                                              fullDetails.data
                                                .classification_title}
                                          </p>
                                        </div>
                                        {fullDetails.data.place_of_origin !=
                                          null && (
                                          <>
                                            <p>
                                              Produced in{" "}
                                              {fullDetails.data.place_of_origin}
                                            </p>
                                          </>
                                        )}

                                        {fullDetails.data.credit_line && (
                                          <>
                                            <div className="creditLine">
                                              <p>
                                                {fullDetails.data.credit_line}
                                              </p>
                                            </div>
                                          </>
                                        )}
                                      </div>

                                      {description !== "" && (
                                        <>
                                          <div
                                            className="detailDescr"
                                            dangerouslySetInnerHTML={{
                                              __html:
                                                DOMPurify.sanitize(description),
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
                                        <p>
                                          On view at Art Institute of Chicago
                                        </p>
                                      )
                                    ) : (
                                      <p>
                                        Stored at Art Institute of Chicago - not
                                        on view
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
                    </>
                  );
                }
              })}

              {results.data.length > 3 && (
                <>
                  <div className="prevNextButtons">
                    {chicagoPage === 1 ? (
                      <>
                        <button id="hidden" onClick={handlePrevPageC}>
                          Last results
                        </button>
                        <img
                          id="paginationLoading"
                          src={cube}
                          alt="results loaded"
                        />
                      </>
                    ) : (
                      <>
                        <button onClick={handlePrevPageC}>Last results</button>
                        {isLoading ? (
                          <img
                            id="paginationLoading"
                            src={smallLoadingGif}
                            alt="results loading"
                          />
                        ) : (
                          <img
                            id="paginationLoading"
                            src={cube}
                            alt="results loaded"
                          />
                        )}
                      </>
                    )}
                    {results.data.length > 9 ? (
                      <>
                        <button onClick={handleNextPageC}>Next results</button>
                      </>
                    ) : (
                      <button id="hidden" onClick={handleNextPageC}>
                        Next results
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )
        ) : results.length > 0 ? (
          <>
            <div className="prevNextButtons">
              {metPrevious.length <= 10 ||
              metPrevious[0] === results[0].objectID ? (
                <button id="hidden" onClick={handlePrevPageM}>
                  Last results
                </button>
              ) : (
                <button onClick={handlePrevPageM}>Last results</button>
              )}
              {isLoading ? (
                <img
                  id="paginationLoading"
                  src={smallLoadingGif}
                  alt="results loading"
                />
              ) : (
                <img id="paginationLoading" src={cube} alt="results loaded" />
              )}
              {results.length > 9 ? (
                <button onClick={handleNextPageM}>Next results</button>
              ) : (
                <button id="hidden" onClick={handleNextPageM}>
                  Next results
                </button>
              )}
            </div>

            {results.map((artwork) => {
              return (
                <>
                  <div key={artwork.objectID} className="artworkCard">
                    <button
                      className="artworkButton"
                      onClick={() => handleMetInfo(artwork.objectID)}
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
                          handleFullImg(artwork.objectID);
                        }}
                      >
                        <img id="expandIcon" src={expand} alt="expand image" />
                      </button>
                    </div>
                  </div>
                  {detailsLoading === true &&
                    isSelected === artwork.objectID && (
                      <>
                        <div className="fullDetails">
                          <button
                            onClick={() => handleMetInfo(artwork.objectID)}
                          >
                            <img src={smallLoadingGif} alt="loading details" />
                          </button>
                        </div>
                      </>
                    )}
                  {detailsLoading === false &&
                    isSelected === artwork.objectID && (
                      <>
                        <div className="fullDetails">
                          <button
                            onClick={() => handleMetInfo(artwork.objectID)}
                          >
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
                              {fullDetails.medium && (
                                <p>{fullDetails.medium}</p>
                              )}
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
                              <p className="creditLine">
                                {fullDetails.creditLine}
                              </p>
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
                </>
              );
            })}
            {results.length > 3 && (
              <>
                <div className="prevNextButtons">
                  {metPrevious.length <= 10 ||
                  metPrevious[0] === results[0].objectID ? (
                    <>
                      <button id="hidden">Last results</button>
                    </>
                  ) : (
                    <>
                      <button onClick={handlePrevPageM}>Last results</button>
                    </>
                  )}
                  {results.length >= 10 ? (
                    <>
                      {isLoading ? (
                        <img
                          src={smallLoadingGif}
                          alt="results loading"
                          id="paginationLoading"
                        />
                      ) : (
                        <img
                          src={cube}
                          alt="results loaded"
                          id="paginationLoading"
                        />
                      )}
                      <button onClick={handleNextPageM}>Next results</button>
                    </>
                  ) : (
                    <>
                      <img
                        src={cube}
                        alt="results loaded"
                        id="paginationLoading"
                      />
                      <button id="hidden" onClick={handleNextPageM}>
                        Next results
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          searchMade === true &&
          isLoading === false && (
            <>
              <p>
                <em>No results currently archived about: {lastSearch}</em>
              </p>
            </>
          )
        )}
      </div>
    </>
  );
}

export default App;
