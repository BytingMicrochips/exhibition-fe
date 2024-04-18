import { useState, useEffect } from "react";
import "./App.css";
import loadingGif from "./assets/loadingGif.gif";
import smallLoadingGif from "./assets/smallLoadingGif.gif";
import cube from "./assets/cube.png";
import DOMPurify from "dompurify";

function App() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  console.log("🚀 ~ App ~ results:", results);
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

  const allArtworks = [];
  let counter = 0;
  let loadTen = 0;

  const fetchResults = async () => {
    const emptyMet = [];
    setIsLoading(true);
    const fullRequest = `${apiSelector}${input}`;

    if (apiSelector === chicagoArtUrl) {
      setMetIdList(emptyMet);
      setMetTotal(0);
      const result = await fetch(
        `${fullRequest}&fields=id,title,thumbnail,image_id&page=${chicagoPage}`
      );
      result.json().then((jsonResponse) => {
        setResults(jsonResponse);
        setIsLoading(false);
        setSearchMade(true);
      });
    }

    if (apiSelector === metMuseumUrl) {
      const result = await fetch(`${fullRequest}`);
      result.json().then((jsonResponse) => {
        if (jsonResponse.total > 0) {
          setMetIdList(jsonResponse.objectIDs);
          setMetTotal(jsonResponse.total);
        } else {
          setMetIdList(emptyMet);
          setMetTotal(jsonResponse.total);
          setIsLoading(false);
          setSearchMade(true);
        }
      });
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

    if (typeof currentArtworkId === "number") {
      const result = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${currentArtworkId}`
      );
      result
        .json()
        .then((jsonResponse) => {
          if (
            jsonResponse.hasOwnProperty("message") ||
            jsonResponse.primaryImageSmall === ""
          ) {
            counter++;
          } else {
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
        });
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const handleSearch = (e) => {
    setLastSearch(input);
    if (chicagoPage != 1) {
      setChicagoPage(1);
    } else {
      fetchResults();
    }
  };

  const handleCollection = (e) => {
    switch (e.currentTarget.value) {
      case "Art Institute of Chicago":
        setApiSelector(chicagoArtUrl);
        break;
      default:
        setApiSelector(metMuseumUrl);
    }
  };

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
      fullDetails.json().then((jsonResponse) => {
        setFullDetails(jsonResponse);
      });
    }    
  };
  
  const handleChicInfo = async (id) => {
    isSelected === id ? setIsSelected("") : setIsSelected(id);
    setDetailsLoading(true);
    if (fullDetails.length === 0 || fullDetails.objectID || fullDetails.data.id != id) {
      const chicSingleArt = `https://api.artic.edu/api/v1/artworks/`;
      const fullDetails = await fetch(chicSingleArt + id);
      fullDetails.json().then((jsonResponse) => {
        setFullDetails(jsonResponse);
      });
    }
    if (fullDetails.data.id === id) {
      setDetailsLoading(false);
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

  return (
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
            <select onChange={handleCollection}>
              <option>Art Institute of Chicago</option>
              <option>Metropolitan Museum NYC</option>
            </select>
          </div>
          <div className="searchButton">
            <button onClick={handleSearch}>Search collections!</button>
          </div>
        </div>
        {isLoading ? (
          <>
            <img alt="loading results" src={loadingGif} width="250" />
          </>
        ) : (
          <></>
        )}

        {metIdList.length > 0 && isLoading === false ? (
          <>
            <div className="resultsFound">
              <p>
                <em>{metIdList.length} results found!</em>
              </p>
            </div>
          </>
        ) : (
          <></>
        )}

        {results.data ? (
          // isLoading === true ? (
          //   <></>
          // ) :
            results.pagination.total === 0 && isLoading === false? (
            <>
              <p>
                <em>No results currently archived about: {lastSearch}</em>
              </p>
            </>
            ) :
              (
            <>
              <div className="resultsFound">
                <p>
                  <em>{results.pagination.total} results found!</em>
                </p>
              </div>
              <div className="prevNextButtons">
                {chicagoPage === 1 ? (
                  <>
                    <button id="hidden" onClick={handlePrevPageC}>
                      Previous results
                    </button>
                    <img
                      id="paginationLoading"
                      src={cube}
                      alt="results loaded"
                    />
                  </>
                    ) :
                      (
                  <>
                    <button onClick={handlePrevPageC}>Previous results</button>
                    {isLoading ? (
                      <img
                        id="paginationLoading"
                        src={smallLoadingGif}
                        alt="results loading"
                      />
                          ) :
                            (
                      <img
                        id="paginationLoading"
                        src={cube}
                        alt="results loaded"
                      />
                    )}
                  </>
                      )
                    }
                {results.data.length > 9 ? (
                  <>
                    <button onClick={handleNextPageC}>Next results</button>
                  </>
                    ) :
                      (
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
                      <div className="artworkCard">
                        <button
                          className="artworkButton"
                          onClick={() => handleChicInfo(artwork.id)}
                        >
                          <div className="artworkCardHeader">
                            <p>{artwork.title}</p>
                          </div>
                          <div className="artworkCardImg">
                            <div className="centeredImg">
                              <img
                                alt={artwork.thumbnail.alt_text}
                                src={`${results.config.iiif_url}/${artwork.image_id}/full/400,/0/default.jpg`}
                                width="200"
                              />
                            </div>
                          </div>
                        </button>
                      </div>

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
                          isSelected === artwork.id ? (
                            <div className="fullDetails">
                              <button
                                onClick={() => handleChicInfo(artwork.id)}
                              >
                                {isSelected === artwork.id ? (
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
                                      null ? (
                                        <>
                                          <p>
                                            Produced in{" "}
                                            {fullDetails.data.place_of_origin}
                                          </p>
                                        </>
                                      ) : (
                                        <></>
                                      )}

                                      {fullDetails.data.credit_line ? (
                                        <>
                                          <div className="creditLine">
                                            <p>
                                              {fullDetails.data.credit_line}
                                            </p>
                                          </div>
                                        </>
                                      ) : (
                                        <></>
                                      )}
                                    </div>

                                    {description === "" ? (
                                      <></>
                                    ) : (
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
                                ) : (
                                  <></>
                                )}
                                <p className="viewAt">
                                  Located at Art Institute of Chicago
                                </p>
                              </button>
                            </div>
                          ) : (
                            <></>
                          )}
                        </>
                      )}
                    </>
                  );
                }
              })}

              {results.data.length > 3 ? (
                <>
                  <div className="prevNextButtons">
                    {chicagoPage === 1 ? (
                      <>
                        <button id="hidden" onClick={handlePrevPageC}>
                          Previous results
                        </button>
                        <img
                          id="paginationLoading"
                          src={cube}
                          alt="results loaded"
                        />
                      </>
                    ) : (
                      <>
                        <button onClick={handlePrevPageC}>
                          Previous results
                        </button>
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
              ) : (
                <></>
              )}
            </>
          )
        ) :
            results.length > 0 ? (
          <>
            <div className="prevNextButtons">
              {metPrevious.length <= 10 ||
              metPrevious[0] === results[0].objectID ? (
                <button id="hidden" onClick={handlePrevPageM}>
                  Previous results
                </button>
              ) : (
                <button onClick={handlePrevPageM}>Previous results</button>
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
                  <div className="artworkCard">
                    <button
                      className="artworkButton"
                      onClick={() => handleMetInfo(artwork.objectID)}
                    >
                      <div className="artworkCardHeader">
                        <p>{artwork.title || "Untitled"}</p>
                      </div>
                      <div className="artworkCardImg">
                        <img
                          alt={artwork.medium}
                          src={artwork.primaryImageSmall}
                          width="200"
                        />
                      </div>
                    </button>
                  </div>
                  {detailsLoading === true &&
                  isSelected === artwork.objectID ? (
                    <>
                      <div className="fullDetails">
                        <button onClick={() => handleMetInfo(artwork.objectID)}>
                          <img src={smallLoadingGif} alt="loading details" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                  {detailsLoading === false &&
                  isSelected === artwork.objectID ? (
                    <>
                      <div className="fullDetails">
                        <button onClick={() => handleMetInfo(artwork.objectID)}>
                          {artwork.artistDisplayName ? (
                            <>
                              <p className="artistDetails">
                                <em>
                                  {fullDetails.artistDisplayName},{" "}
                                  {fullDetails.artistRole ? (
                                    `${fullDetails.artistRole}, `
                                  ) : (
                                    <></>
                                  )}
                                  {fullDetails.culture ||
                                    fullDetails.country ||
                                    ` department of ${fullDetails.department}`}
                                </em>
                              </p>
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
                            <p>
                              {fullDetails.medium ? fullDetails.medium : <></>}
                            </p>
                            <p>
                              {fullDetails.objectDate
                                ? fullDetails.objectDate
                                : fullDetails.objectEndDate ||
                                  fullDetails.objectBeginDate ||
                                  fullDetails.excavation ||
                                  fullDetails.period}
                            </p>
                          </div>
                          <p className="creditLine">
                            {fullDetails.creditLine ? (
                              fullDetails.creditLine
                            ) : (
                              <></>
                            )}
                            {fullDetails.repository ? (
                              <>
                                <p className="viewAt">
                                  Located at {fullDetails.repository}
                                </p>
                              </>
                            ) : (
                              <></>
                            )}
                          </p>
                        </button>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              );
            })}
            {results.length > 3 ? (
              <>
                <div className="prevNextButtons">
                  {metPrevious.length <= 10 ||
                  metPrevious[0] === results[0].objectID ? (
                    <>
                      <button id="hidden">Previous results</button>
                    </>
                  ) : (
                    <>
                      <button onClick={handlePrevPageM}>
                        Previous results
                      </button>
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
                      <button id="hidden" onClick={handleNextPageM}>Next results</button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <></>
            )}
          </>
        ) : searchMade === true && isLoading === false? (
          <>
            <p>
              <em>No results currently archived about: {lastSearch}</em>
            </p>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default App;
