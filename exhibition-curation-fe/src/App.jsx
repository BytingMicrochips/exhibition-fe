import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  console.log("🚀 ~ App ~ results:", results)
  const [apiSelector, setApiSelector] = useState(
    "https://data.nhm.ac.uk/api/3/action/resource_search?query=name:"
  );


  const naturalHistoryUrl =
    // `https://data.nhm.ac.uk/api/3/action/package_search?q=${query}`;
    `https://data.nhm.ac.uk/api/3/action/resource_search?query=name:`;
  
  const chicagoArtUrl = `https://api.artic.edu/api/v1/artworks/search?q=`;

  const fetchResults = async () => {
    const result = await fetch(apiSelector+query);
    result.json().then((jsonResponse) => {
      if (jsonResponse.result) {
        setResults(jsonResponse.result);
      } else {
        setResults(jsonResponse);
      }
    });
  };

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const handleSearch = (e) => {
    setQuery(input);
    fetchResults();
  };

  const handleCollection = (e) => {
    switch (e.currentTarget.value) {
      case "London Natural History Museum":
        setApiSelector(naturalHistoryUrl);
        break;
      case "Art Institute of Chicago":
        setApiSelector(chicagoArtUrl);
        break;
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

        {apiSelector === naturalHistoryUrl ? (
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
                  <p>{item.description}</p>
                </>
              ))}
            </>
          ) : (
            <>
              <p>
                <em>No results currently archived about: {query}</em>
              </p>
            </>
          )
        ) : results.data ? (
          <>
            <p> {results.data.length} results from chicago art institute</p>

            {results.data.map((artwork) => {
              return (
                <>
                  <p>{artwork.title}</p>
                  <img
                      alt={artwork.thumbnail.alt_text}
                      l
                    src={artwork.thumbnail.lqip} 
                      width="200"
                  />
                  
                </>
              );
            })}
          </>
        ) : (
          <>
            <p>
              <em>
                No results currently archived about: {query} from{" "}
                {chicagoArtUrl + query}
              </em>
            </p>
          </>
        )}
      </div>
    </>
  );
}

export default App;
