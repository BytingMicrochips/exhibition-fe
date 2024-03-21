import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [apiSelector, setApiSelector] = useState("https://data.nhm.ac.uk/api/3/action/resource_search?query=name:");
  console.log("🚀 ~ App ~ results:", results);

  const naturalHistoryUrl = `https://data.nhm.ac.uk/api/3/action/resource_search?query=name:`;
  const chicagoArtUrl = `https://api.artic.edu/api/v1/artworks/search?q=`;

  const fetchResults = async () => {
      const fullRequest = `${apiSelector}${query}`;
    if (apiSelector === chicagoArtUrl){
      const result = await fetch(`${fullRequest}&fields=id,title,thumbnail,image_id`);
        result.json().then((jsonResponse) => {
          setResults(jsonResponse);
        });
    }
    if (apiSelector === naturalHistoryUrl) {
      const result = await fetch(fullRequest)
        result.json().then((jsonResponse) => {
          setResults(jsonResponse.result);
        }
      );

    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const handleSearch = (e) => {
    setQuery(input)
    fetchResults();
  
  };

    const handleCollection = (e) => {
      switch (e.currentTarget.value) {
        case "Art Institute of Chicago":
          setApiSelector(chicagoArtUrl);
          break;
        default:
          setApiSelector(naturalHistoryUrl);
      }
    }

  return (
    <>
      <h1>Artwork & artifacts online</h1>
      <div className="card">
        <h2>Explore museum and gallery collections</h2>
        <p>
          Results are sourced from the Art Institute of Chicago and London
          Natural History Museum collections
        </p>
      </div>
      <div>
        <h3>Input search criteria</h3>
        <input onChange={handleInput}></input>
        <select onChange={handleCollection}>
          <option>London Natural History Museum</option>
          <option>Art Institute of Chicago</option>
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
                <em>No results currently archived about LINE 86: {query}</em>
              </p>
            </>
          )
        ) : results.data ? (
          <>
            <p>
              {" "}
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
        ) : query === "" ? 
          <></>
         : (
          (
            <>
              <p>
                <em>No results currently archived about: {query}</em>
              </p>
            </>
          )
        )}
      </div>
    </>
  );
}

export default App;
