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
  let validId = metPrevious[(displayIndex -10) + recallIndex];
    
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
  },[input])

  return (
    <>
      <h1>Artwork & artifacts online</h1>
      <div className="card">
        <h2>Explore museum and gallery collections</h2>
        <p>
          Results are sourced from the Art Institute of Chicago and Metropolitan
          Museum NYC collections
        </p>
      </div>
      <div>
        <h3>Input search criteria</h3>
        <input onChange={handleInput}></input>
        <select onChange={handleCollection}>
          <option>Art Institute of Chicago</option>
          <option>Metropolitan Museum NYC</option>
        </select>
        <button onClick={handleSearch}>Search collections</button>

        {isLoading ? (
          <>
            <img alt="loading results" src={loadingGif} width="250" />
          </>
        ) : (
          <></>
        )}

        {metIdList.length > 0 && isLoading === false ? (
          <>
            <p>
              <em>{metIdList.length} results found!</em>
            </p>
          </>
        ) : (
          <></>
        )}

        {results.results ? (
          input === "" ? (
            <></>
          ) : results.count && results.count != 0 && isLoading === false ? (
            <>
              <p>
                <em>{results.count} results found!</em>
              </p>
              {results.results.map((item) => (
                <>
                  <p> {item.name}</p>
                </>
              ))}
            </>
          ) : (
            <>
              <p>
                <em>No results currently archived about: {input}</em>
              </p>
            </>
          )
        ) : results.data ? (
          isLoading === true ? (
            <></>
          ) : results.pagination.total === 0 ? (
            <>
              <p>
                <em>No results currently archived about: {input}</em>
              </p>
            </>
          ) : (
            <>
              <p>
                <em>{results.pagination.total} results found!</em>
              </p>

              {chicagoPage === 1 ? (
                <></>
              ) : (
                <>
                  <button onClick={handlePrevPageC}>Previous results</button>
                </>
              )}

              <button onClick={handleNextPageC}>Next results</button>
              {results.data.map((artwork) => {
                if (artwork.thumbnail) {
                  return (
                    <>
                      <p>{artwork.title}</p>
                      <img
                        alt={artwork.thumbnail.alt_text}
                        src={`${results.config.iiif_url}/${artwork.image_id}/full/843,/0/default.jpg`}
                        width="200"
                      />
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
            {metPrevious.length <= 10 ||
            metPrevious[0] === results[0].objectID ? (
              <></>
            ) : (
              <>
                <button onClick={handlePrevPageM}>Previous results</button>
              </>
            )}
            <button onClick={handleNextPageM}>Next results</button>

            {results.map((artwork) => {
              return (
                <>
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

                  <img
                    alt={artwork.medium}
                    src={artwork.primaryImageSmall}
                    width="200"
                  />
                </>
              );
            })}
          </>
              ) : (
                  searchMade === true? (<>
            <p>
              <em>No results currently archived about: {input}</em>
            </p>
          </>):(<></>)

        )}
      </div>
    </>
  );
}


export default App;
