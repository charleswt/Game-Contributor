import "../../../public/css/style.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { SEARCH_RESULTS } from "../../utils/queries";
import CookieAuth from "../../utils/auth";

interface NameResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: string;
}

interface UsernameResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: string;
}

interface CompanyResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  companyName: string;
  profileImage: string;
}

interface SearchResults {
  nameResponse?: NameResponse[];
  usernameResponse?: UsernameResponse[];
  companyResponse?: CompanyResponse[];
}

export default function Search() {
  const [input, setInput] = useState<JSX.Element>();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState<string>("");

  const { loading: loadingResults, data: resultsData } = useQuery(
    SEARCH_RESULTS,
    {
      variables: { searchInput },
      skip: searchInput.trim() === "",
    }
  );
  useEffect(()=>{
    if (window.innerWidth > 850) {
        navigate("/main")
    } 
  })
  

  const handleSearchResultsBgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSearchInput("");
    }
  };

  return (
    <div className="searchFix">
      <div className="searchTextArea">
        <textarea
          name="text"
          wrap="soft"
          style={{ overflow: "hidden", resize: "none" }}
          cols={32}
          rows={1}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <button className="escSearch" onClick={() => setSearchInput("")}>
            &#x2715;
          </button>
        )}
      </div>
      <p className="back"></p>
      {searchInput && (
        <div className="searchPageResultsBg" onClick={handleSearchResultsBgClick}>
          <div className="bg searchPageResults" onClick={(e) => e.stopPropagation()}>
            <p>Search Results</p>
            {resultsData?.search?.nameResponse && (
              <div>
                {resultsData?.search?.nameResponse.length >= 1 && (
                  <h3>Name Response</h3>
                )}
                {resultsData.search.nameResponse.map((user: NameResponse) => (
                  <div className="searchResult" key={user.id}>
                    <img
                      src={user.profileImage}
                      alt={`${user.username}'s profile`}
                    />
                    <p>
                      {user.firstName} {user.lastName}
                    </p>
                    <p
                      style={{ color: "purple" }}
                      onClick={() => {
                        navigate(`/user/${user.id}`);
                        setSearchInput("");
                      }}
                    >
                      {" "}
                      @{user.username}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {resultsData?.search?.usernameResponse && (
              <div>
                {resultsData?.search?.usernameResponse.length >= 1 && (
                  <h3>Username Response</h3>
                )}
                {resultsData.search.usernameResponse.map(
                  (user: UsernameResponse) => (
                    <div className="searchResult" key={user.id}>
                      <img
                        src={user.profileImage}
                        alt={`${user.username}'s profile`}
                      />
                      <p>
                        {user.firstName} {user.lastName}
                      </p>
                      <p
                        style={{ color: "purple" }}
                        onClick={() => {
                          navigate(`/user/${user.id}`);
                          setSearchInput("");
                        }}
                      >
                        @{user.username}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
            {resultsData?.search?.companyResponse && (
              <div>
                {resultsData?.search?.companyResponse.length >= 1 && (
                  <h3>Company Response</h3>
                )}
                {resultsData.search.companyResponse.map(
                  (user: CompanyResponse) => (
                    <div className="searchResult" key={user.id}>
                      <img
                        src={user.profileImage}
                        alt={`${user.username}'s profile`}
                      />
                      <p>
                        {user.firstName} {user.lastName}
                      </p>
                      <p
                        style={{ color: "purple" }}
                        onClick={() => {
                          navigate(`/user/${user.id}`);
                          setSearchInput("");
                        }}
                      >
                        {" "}
                        @{user.username}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
            {!resultsData?.search?.nameResponse &&
              !resultsData?.search?.usernameResponse &&
              !resultsData?.search?.companyResponse && <p>No results found</p>}
          </div>
        </div>
      )}
    </div>
  );
}
