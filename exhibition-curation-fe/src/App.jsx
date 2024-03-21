import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const naturalHistoryUrl =
    // `https://data.nhm.ac.uk/api/3/action/package_search?q=${query}`;
    `https://data.nhm.ac.uk/api/3/action/resource_search?query=name:${query}`;

    const fetchNaturalHist = async () => {
      const result = await fetch(naturalHistoryUrl)
      result.json().then(jsonResponse => {
        console.log(jsonResponse);
        setResults(jsonResponse.result)
      })
    }

    const handleInput = (e) => {
      setInput(e.target.value);
    };

  const handleSearch = (e) => {
    setQuery(input)
    fetchNaturalHist();
    }
  return (
    <>
      <h1>Artwork & artifacts online</h1>
      <div className="card">
        <h2>Explore museum and gallery collections</h2>
        <p>
          Results are sourced from ~~~ gallery, ~~~ university and London
          Natural History Museum collections
        </p>
      </div>
      <div>
        <h3>Input search criteria</h3>
        <input onChange={handleInput}></input>
        <button onClick={handleSearch}>Search collections</button>
        {query === "" ? (
          <></>
        ) : results.count && results.count != 0 ? (
          <>
            <p>
              {" "}
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
        )}
      </div>
    </>
  );
}

export default App
