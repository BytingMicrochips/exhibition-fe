import { useState, useEffect } from "react";
import "./App.css";
import loadingGif from "./assets/loadingGif.gif";

function App() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [apiSelector, setApiSelector] = useState("https://api.artic.edu/api/v1/artworks/search?q=");
  const [metIdList, setMetIdList] = useState([]);
  const [metTotal, setMetTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [chicagoPage, setChicagoPage] = useState(1);
  const [metIndex, setMetIndex] = useState(0);
  const [metPrevious, setMetPrevious] = useState([]);
  const [loadMetPrev, setLoadMetPrev] = useState(false);
  const [searchMade, setSearchMade] = useState(false);
  const [lastSearch, setLastSearch] = useState('');
  const [fullDetails, setFullDetails] = useState([]);
  const [isSelected, setIsSelected] = useState("");
  const [description, setDescription] = useState("");
  console.log("🚀 ~ App ~ fullDetails:", fullDetails)
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
    setLastSearch(input)
    fetchResults();
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
    if (displayIndex > (metPrevious.length - 11)) {
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
    const displayIndex = metPrevious.indexOf(results[0].objectID)
    let validId = metPrevious[(displayIndex - 10) + recallIndex];
    
    const result = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${validId}`
    )
    result.json().then((jsonResponse) => {
      allArtworks.push(jsonResponse);
      recallIndex++;
    }).then(() => {
      if (recallIndex < 10) {
        fetchPrevMet();
      } else {
        setResults(allArtworks);
        setIsLoading(false)
        recallIndex = 0;
        setLoadMetPrev(false);
      }
    })
  };

  const fetchNextKnown = async (displayIndex) => {
    setIsLoading(true);
    let validId = metPrevious[(displayIndex + 10 + recallIndex)];
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
  }

  useEffect(() => {
    if (apiSelector === metMuseumUrl) {
      setMetPrevious([]);
    }
  }, [input])

  const handleMetInfo = async (e) => {
    console.log("handleMetInfo 223", e);
  }

  const handleChicInfo = async (id) => {
    isSelected === id ? setIsSelected("") : setIsSelected(id);
    console.log("handleChicInfo 227", id);
    const chicSingleArt = `https://api.artic.edu/api/v1/artworks/`;
    const fullDetails = await fetch(chicSingleArt + id);
    fullDetails
      .json()
      .then((jsonResponse) => {
        setFullDetails(jsonResponse)
      })
  }

  useEffect(() => {
    console.log('setting description useEffect 241')
    if (fullDetails.data && fullDetails.data.description != null) {
      const extractDisc = fullDetails.data.description;
      setDescription(extractDisc);
    } else {
      setDescription('');
    }
  },[fullDetails])

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

        {results.results ? (
          input === "" ? (
            <></>
          ) : results.count && results.count != 0 && isLoading === false ? (
              <>
            <div className="resultsFound">
              <p>
                <em>{results.count} results found!</em>
                  </p>
            </div>
              {results.results.map((item) => (
                <>
                  <p> {item.name}</p>
                </>
              ))}
            </>
          ) : (
            <>
              <p>
                <em>No results currently archived about: {lastSearch}</em>
              </p>
            </>
          )
        ) : results.data ? (
          isLoading === true ? (
            <></>
          ) : results.pagination.total === 0 ? (
            <>
              <p>
                <em>No results currently archived about: {lastSearch}</em>
              </p>
            </>
          ) : (
                  <>
            <div className="resultsFound">    
              <p>
                <em>{results.pagination.total} results found!</em>
                      </p>
            </div>
              <div className="prevNextButtons">
                {chicagoPage === 1 ? (
                  <></>
                ) : (
                  <>
                    <button onClick={handlePrevPageC}>Previous results</button>
                  </>
                )}

                <button onClick={handleNextPageC}>Next results</button>
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
                                src={`${results.config.iiif_url}/${artwork.image_id}/full/843,/0/default.jpg`}
                                width="200"
                              />
                            </div>
                          </div>
                        </button>
                      </div>
                      {fullDetails.length != 0 ? (
                        <div className="fullDetails">
                          <button>
                            {isSelected === artwork.id ? (
                              <>
                                <p>
                                  {`Artist: ${fullDetails.data.artist_title}` ||
                                    "Artist unknown"}
                                </p>
                                <p>
                                  {fullDetails.data.date_display ||
                                    fullDetails.data.date_end ||
                                    fullDetails.data.date_start}
                                  ,{" "}
                                  {fullDetails.data.medium_display ||
                                    fullDetails.data.classification_title}
                                </p>

                                {fullDetails.data.place_of_origin != null ? (
                                  <>
                                    <p>{fullDetails.data.place_of_origin}</p>
                                  </>
                                ) : (
                                  <></>
                                )}

                                {description === "" ? (
                                  <></>
                                ) : (
                                  <>
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: description,
                                      }}
                                    />
                                  </>
                                )}
                              </>
                            ) : (
                              <></>
                            )}
                          </button>
                        </div>
                      ) : (
                        <></>
                      )}
                    </>
                  );
                }
              })}
            </>
          )
        ) : input === "" ? (
          <></>
        ) : results.length > 0 ? (
          <>
            <div className="prevNextButtons">
              {metPrevious.length <= 10 ||
              metPrevious[0] === results[0].objectID ? (
                <></>
              ) : (
                <>
                  <button onClick={handlePrevPageM}>Previous results</button>
                </>
              )}
              <button onClick={handleNextPageM}>Next results</button>
            </div>

            {results.map((artwork) => {
              return (
                <>
                  <div className="artworkCard">
                    <button className="artworkButton" onClick={handleMetInfo}>
                      <div className="artworkCardHeader">
                        {artwork.artistDisplayName ? (
                          <>
                            <p>{artwork.title}</p>
                            <p>
                              <em>
                                {artwork.artistDisplayName},{" "}
                                {artwork.culture ||
                                  artwork.country ||
                                  ` department of ${artwork.department}`}
                              </em>
                            </p>
                          </>
                        ) : (
                          <>
                            <p>{artwork.title}</p>
                            <p>
                              <em>
                                Artist unknown,{" "}
                                {artwork.culture ||
                                  artwork.country ||
                                  ` department of ${artwork.department}`}
                              </em>
                            </p>
                          </>
                        )}
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
                </>
              );
            })}
          </>
        ) : searchMade === true ? (
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
