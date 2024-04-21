import React, { useState, useEffect, useContext, createContext } from "react";
import "../../src/App.css";
import loadingGif from "../assets/loadingGif.gif";
import { Fragment } from "react";
import Title from "./Title";
import Modal from "./Modal";
import ResultsMapChic from "./ResultsMapChic";
import ResultsMapMet from "./ResultsMapMet";
import ResultsCounter from "./ResultsCounter";
import PaginationBar from "./PaginationBar";
import Loading from "./Loading";

export const ModalContext = createContext();
export const IsSelectedContext = createContext();
export const ModalPropsContext = createContext();
export const PaginationContext = createContext();

function App() {
  const chicagoArtUrl = `https://api.artic.edu/api/v1/artworks/search?q=`;
  const metMuseumUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=`;
  const [apiSelector, setApiSelector] = useState("https://api.artic.edu/api/v1/artworks/search?q=");
  const [controlApi, setControlApi] = useState("Art Institute of Chicago");

  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [metIdList, setMetIdList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chicagoPage, setChicagoPage] = useState(1);
  const [metIndex, setMetIndex] = useState(0);
  const [metPrevious, setMetPrevious] = useState([]);
  const [loadMetPrev, setLoadMetPrev] = useState(false);
  const [searchMade, setSearchMade] = useState(false);
  const [lastSearch, setLastSearch] = useState("");
  const [fullDetails, setFullDetails] = useState([]);
  const [expanded, setExpanded] = useState("");
  const [isSelected, setIsSelected] = useState("");
  const [description, setDescription] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const [thumbLength, setThumbLength] = useState(0);
  const [pageValue, setPageValue] = useState(1);
  const [lastPageValue, setLastPageValue] = useState(1);
  const [errMsg, setErrorMsg] = useState("");

  const allArtworks = [];
  let counter = 0;
  let loadTen = 0;
  let recallIndex = 0;

  const fetchResults = async () => {
    const emptyMet = [];
    setModal(false);
    setIsLoading(true);
    const fullRequest = `${apiSelector}${input}`;

    if (apiSelector === chicagoArtUrl) {
      setMetIdList(emptyMet);
      const result = await fetch(
        `${fullRequest}&fields=id,title,thumbnail,image_id&page=${chicagoPage}`
      );
      result
        .json()
        .then((jsonResponse) => {
          setResults(jsonResponse);
          setIsLoading(false);
          setSearchMade(true);
        })
        .catch((err) => {
          setErrorMsg(err.message);
        });
    }
    if (apiSelector === metMuseumUrl) {
      const result = await fetch(`${fullRequest}`);
      result
        .json()
        .then((jsonResponse) => {
          if (jsonResponse.total > 0) {
            setMetIdList(jsonResponse.objectIDs);
          } else {
            setMetIdList(emptyMet);
            setIsLoading(false);
            setSearchMade(true);
          }
        })
        .catch((err) => {
          setErrorMsg(err.message);
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

    if (
      typeof currentArtworkId === "number" &&
      typeof currentArtworkId !== "undefined"
    ) {
      const result = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${currentArtworkId}`
      );
      if (typeof result !== "undefined") {
        result
          .json()
          .then((jsonResponse) => {
            if (jsonResponse.primaryImageSmall === "") {
              counter++;
            } else if (jsonResponse.hasOwnProperty("message")) {
              counter++;
              fetchMet(counter);
              throw Error(`Server says: ${jsonResponse.message}`);
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
          })
          .catch((err) => {
            setErrorMsg(err.message);
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
    setMetPrevious([]);
    setIsSelected("");
    setErrorMsg("");
    if (chicagoPage != 1 || pageValue != 1) {
      setChicagoPage(1);
      setPageValue(1);
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
    }
  };

  useEffect(() => {
    setErrorMsg("");
    if (apiSelector === chicagoArtUrl) {
      if (pageValue > lastPageValue) {
        handleNextPageC();
        setLastPageValue(pageValue)
      } else {
        handlePrevPageC();
      }
    } else {
      if (pageValue > lastPageValue) {
        handleNextPageM();
        setLastPageValue(pageValue);
      } else {
        handlePrevPageM();
        setLastPageValue(pageValue);
      }
  }
  }, [pageValue]);

  const handleNextPageC = () => {
    setChicagoPage(pageValue);
  };

  const handlePrevPageC = () => {
    if (lastPageValue - 1 > 0) {
      setChicagoPage(pageValue);
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

  const fetchPrevMet = async () => {
    if (Array.isArray(results)) {
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
          if (validId === metPrevious[metPrevious.length - 1]) {
                setResults(allArtworks);
                setIsLoading(false);
                recallIndex = 0;
                setLoadMetPrev(false);
          }
          else if (recallIndex < 10) {
              fetchPrevMet();
            } else {
              setResults(allArtworks);
              setIsLoading(false);
              recallIndex = 0;
              setLoadMetPrev(false);
            }
        })
        .catch((err) => {
          setErrorMsg(err.message);
        });
    }
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
          if (validId === metPrevious[metPrevious.length - 1]) {
            setResults(allArtworks);
            setIsLoading(false);
            recallIndex = 0;
            setLoadMetPrev(false);
          } else if (recallIndex < 10) {
          fetchNextKnown(displayIndex);
        } else {
          setResults(allArtworks);
          setIsLoading(false);
          recallIndex = 0;
          setLoadMetPrev(false);
        }
      })
      .catch((err) => {
          setErrorMsg(err.message);
      });
  };

  useEffect(() => {
    if (apiSelector === metMuseumUrl) {
      setMetPrevious([]);
    }
  }, [input]);

  const handleChicInfo = async (expanded) => {
    isSelected === expanded ? setIsSelected("") : setIsSelected(expanded);
    setDetailsLoading(true);
    if (fullDetails.data && fullDetails.data.id === expanded) {
      setDetailsLoading(false);
    } else if (
      fullDetails.length === 0 ||
      fullDetails.objectID ||
      fullDetails.data.id != expanded
    ) {
      const chicSingleArt = `https://api.artic.edu/api/v1/artworks/`;
      const fullDetails = await fetch(chicSingleArt + expanded);
      fullDetails
        .json()
        .then((jsonResponse) => {
          setFullDetails(jsonResponse);
        })
        .catch((err) => {
          setErrorMsg(err.message);
        });
    }
  };

  const handleMetInfo = async (id) => {
    isSelected === id ? setIsSelected("") : setIsSelected(id);
    if (
      fullDetails.length === 0 ||
      (fullDetails.objectID != id && id.length !== 0)
    ) {
      setDetailsLoading(true);
      const metSingleArt = `https://collectionapi.metmuseum.org/public/collection/v1/objects/`;
      const fullDetails = await fetch(metSingleArt + id);
      fullDetails
        .json()
        .then((jsonResponse) => {
          setFullDetails(jsonResponse);
        })
        .catch((err) => {
          setErrorMsg(err.message);
        });
    }
  };

  useEffect(() => {
    if (apiSelector === chicagoArtUrl) {
      handleChicInfo(expanded);
    }
    if (apiSelector === metMuseumUrl) {
      handleMetInfo(expanded);
    }
  }, [expanded]);

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

  useEffect(() => {
    if (apiSelector === chicagoArtUrl && results.length !== 0 && results.data) {
      const hasThumbnail = results.data.filter((artwork) => artwork.thumbnail);
      setThumbLength(hasThumbnail.length);
    }
  }, [results]);

  return (
    <>
      <ModalContext.Provider value={[modal, setModal]}>
        <ModalPropsContext.Provider value={[modalProps, setModalProps]}>
          <PaginationContext.Provider value={[pageValue, setPageValue]}>
            {modal ? (
              <Modal />
            ) : (
              <>
                <Title />
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
                      <button onClick={handleSearch}>
                        Search collections!
                      </button>
                    </div>
                  </div>
                  {isLoading && (
                    <Loading errMsg={errMsg}/>
                  )}

                  {metIdList.length > 0 && isLoading === false && (
                    <ResultsCounter total={results.length} />
                  )}

                  {results.data ? (
                    results.pagination.total === 0 && isLoading === false ? (
                      <ResultsCounter lastSearch={lastSearch} total={0} />
                    ) : (
                      <Fragment key="resultsFrag">
                        <ResultsCounter total={thumbLength} />
                        <PaginationBar
                          results={results}
                          isLoading={isLoading}
                          apiSelector={apiSelector}
                        />
                        <IsSelectedContext.Provider
                          value={[expanded, setExpanded]}
                        >
                          <ResultsMapChic
                            results={results}
                            isSelected={isSelected}
                            detailsLoading={detailsLoading}
                            fullDetails={fullDetails}
                            description={description}
                          />
                        </IsSelectedContext.Provider>
                        {results.data.length > 3 && (
                          <React.Fragment key={"bottomPagin"}>
                            <PaginationBar
                              results={results}
                              isLoading={isLoading}
                              apiSelector={apiSelector}
                            />
                          </React.Fragment>
                        )}
                      </Fragment>
                    )
                  ) : results.length > 0 ? (
                    <React.Fragment key="showingRes">
                      <PaginationBar
                        results={results}
                        isLoading={isLoading}
                        apiSelector={apiSelector}
                      />
                      <IsSelectedContext.Provider
                        value={[expanded, setExpanded]}
                      >
                        <ResultsMapMet
                          results={results}
                          detailsLoading={detailsLoading}
                          fullDetails={fullDetails}
                        />
                      </IsSelectedContext.Provider>

                      {results.length > 3 && (
                        <PaginationBar
                          results={results}
                          isLoading={isLoading}
                          apiSelector={apiSelector}
                        />
                      )}
                    </React.Fragment>
                  ) : (
                    searchMade === true &&
                    isLoading === false && (
                      <ResultsCounter lastSearch={lastSearch} total={0} />
                    )
                  )}
                </div>
              </>
            )}
          </PaginationContext.Provider>
        </ModalPropsContext.Provider>
      </ModalContext.Provider>
    </>
  );
}

export default App;