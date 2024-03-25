import { useState, useEffect } from "react";
import "./App.css";
import  loadingGif  from "./assets/loadingGif.gif";

function App() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [apiSelector, setApiSelector] = useState("https://api.artic.edu/api/v1/artworks/search?q=");
  const [metIdList, setMetIdList] = useState([]);
  const [metTotal, setMetTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const chicagoArtUrl = `https://api.artic.edu/api/v1/artworks/search?q=`;
  const metMuseumUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=`;
  
  const allArtworks = [];
  let counter = 0;
  let counterImg = 0;
  let loadTen = 0;
  
  const fetchResults = async () => {
    const fullRequest = `${apiSelector}${input}`;
    if (apiSelector === chicagoArtUrl){
      const result = await fetch(`${fullRequest}&fields=id,title,thumbnail,image_id`);
          setIsLoading(true);
      result.json().then((jsonResponse) => {
        setResults(jsonResponse);
          setIsLoading(false);
      });
    }
    if (apiSelector === metMuseumUrl) {
      const result = await fetch(`${fullRequest}`);
        setIsLoading(true);
      result.json().then((jsonResponse) => {
        setMetIdList(jsonResponse.objectIDs);
        setMetTotal(metIdList.length);
        fetchMet(counter);
      })
    }
  };

  const fetchMet = async (counter) => {
    let currentArtworkId = metIdList[counter];

    if (typeof currentArtworkId === "number") {
      const result = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${currentArtworkId}`
      );
      result.json().then((jsonResponse) => {
        if (
          jsonResponse.hasOwnProperty("message") ||
          jsonResponse.primaryImageSmall === ''
        ) {
          counter++;
        } else {
          allArtworks.push(jsonResponse);
          counter++;
          loadTen++;
        }
      }).then(() => {
          if (counter < metIdList.length - 1 && loadTen < 10) {
            fetchMet(counter);
          } else {
            setResults(allArtworks);
            setIsLoading(false);
            loadTen = 0;
          }
      })
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

        {metIdList.length > 0 ? (
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
          ) : results.count && results.count != 0 ? (
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
                <em>No results currently archived about LINE 86: {input}</em>
              </p>
            </>
          )
        ) : results.data ? (
          <>
            <p>{results.pagination.total} results from chicago art institute</p>

            {results.data.map((artwork) => {
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
            })}
          </>
        ) : input === "" ? (
          <></>
        ) : results.length > 0 ? (
          results.map((artwork) => {
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
          })
        ) : (
          <>
            <p>
              <em>No results currently archived about LINE 116: {input}</em>
            </p>
          </>
        )}
      </div>
    </>
  );
}

export default App;
