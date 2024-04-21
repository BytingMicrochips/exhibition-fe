import { Fragment, useContext } from "react";
import cube from "../assets/cube.png";
import smallLoadingGif from "../assets/smallLoadingGif.gif";
import { PaginationContext } from "./App";

const PaginationBar = ({ results, isLoading}) => {
    const [pageValue, setPageValue] = useContext(PaginationContext);

    const handleNext = () => {
        let currentPage = pageValue;
        setPageValue(currentPage+1)
    }

    const handlePrev = () => {
        let currentPage = pageValue;
        setPageValue(currentPage-1);
    }

    return (
      <Fragment key={"prevNextButtons"}>
        <div className="prevNextButtons">
          {pageValue === 1 ? (
            <Fragment key={"buttonOrLoading"}>
              <button id="hidden" onClick={handlePrev}>
                Last results
              </button>
              {isLoading ? (
                <img
                  id="paginationLoading"
                  src={smallLoadingGif}
                  alt="results loading"
                />
              ) : (
                <img id="paginationLoading" src={cube} alt="results loaded" />
              )}
            </Fragment>
          ) : (
            <>
              <button onClick={handlePrev}>Last results</button>
              {isLoading ? (
                <img
                  id="paginationLoading"
                  src={smallLoadingGif}
                  alt="results loading"
                />
              ) : (
                <img id="paginationLoading" src={cube} alt="results loaded" />
              )}
            </>
          )}

          {results.data ? (
            results.data.length > 9 ? (
              <>
                <button onClick={handleNext}>Next results</button>
              </>
            ) : (
              <>
                <button id="hidden" onClick={handleNext}>
                  Next results
                </button>
              </>
            )
          ) : results.length > 9 ? (
            <>
              <button onClick={handleNext}>Next results</button>
            </>
          ) : (
            <>
              <button id="hidden" onClick={handleNext}>
                Next results
              </button>
            </>
          )}
        </div>
      </Fragment>
    );
};

export default PaginationBar;