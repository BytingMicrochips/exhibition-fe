import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [apiSelector, setApiSelector] = useState("https://api.artic.edu/api/v1/artworks/search?q=");
  const [metIdList, setMetIdList] = useState([]);
  const [metTotal, setMetTotal] = useState(0);
  
  const chicagoArtUrl = `https://api.artic.edu/api/v1/artworks/search?q=`;
  const metMuseumUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=`;
  
  const allArtworks = [];
  let counter = 0;
  let loadTwenty = 0;
  
  const fetchResults = async () => {
    const fullRequest = `${apiSelector}${input}`;
    if (apiSelector === chicagoArtUrl){
      const result = await fetch(`${fullRequest}&fields=id,title,thumbnail,image_id`);
      result.json().then((jsonResponse) => {
        setResults(jsonResponse);
      });
    }
    if (apiSelector === metMuseumUrl) {
      const result = await fetch(`${fullRequest}`);
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
        allArtworks.push(jsonResponse);
        counter++;
        loadTwenty++;
      }).then(() => {
          if (counter < metIdList.length - 1 && loadTwenty < 19) {
            fetchMet(counter);
          } else {
            setResults(allArtworks);
            loadTwenty = 0;
          }
      })
    }
    console.log("🚀 ~ allArtworks:", allArtworks)
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

        {results.results ? (
          query === "" ? (
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
            <p>
              {results.pagination.total} results from chicago art institute
            </p>

            {results.data.map((artwork) => {
              return (
                <>
                  <p>{artwork.title}</p>
                  <img
                    alt={artwork.thumbnail.alt_text}
                    l
                    src={`${results.config.iiif_url}/${artwork.image_id}/full/843,/0/default.jpg`}
                    width="200"
                  />
                </>
              );
            })}
          </>
        ) : input === "" ? (
          <></>
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
