import '../../../public/css/style.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { SEARCH_RESULTS } from "../../utils/queries";
import CookieAuth from '../../utils/auth';

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

export default function Navbar() {
    const [input, setInput] = useState<JSX.Element>();
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState<string>("");

    const { loading: loadingResults, data: resultsData } = useQuery(SEARCH_RESULTS, {
        variables: { searchInput },
        skip: searchInput.trim() === ""
    });

    CookieAuth.checkExpiration();

    useEffect(() => {
        const updateInput = () => {
            if (window.innerWidth > 850) {
                if(window.location.href.split("/").find((search)=>search === "search")){
                    navigate("main")
                }
                setInput(
                    <div style={{ position: 'relative' }}>
                        <textarea
                            name="text"
                            wrap="soft"
                            style={{ overflow: 'hidden', resize: 'none' }}
                            cols={32}
                            rows={1}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        {searchInput && (
                            <button
                            className='escSearch'
                                onClick={() => setSearchInput("")}
                            >
                                &#x2715;
                            </button>
                        )}
                    </div>
                );
            } else {
                
                setInput(
                    <div className='searchSmall' onClick={() => navigate(`/search/${searchInput}`)}></div>
                );
            }
        };

        updateInput();

        window.addEventListener('resize', updateInput);

        return () => {
            window.removeEventListener('resize', updateInput);
        };
    }, [searchInput, navigate]);

    const handleMeClick = () => {
        const token = CookieAuth.getToken();
        navigate(token ? '/me' : '/login');
    };

    const handleSearchResultsBgClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setSearchInput("");
        }
    };

    return (
        <>
            <header>
                <ul>
                    <li className='logo'>
                        <img src="/images/GC.png" alt="Logo" height="60px" />
                    </li>
                    {input}
                    <li onClick={() => navigate("/main")}>
                        <img src="/images/home.svg" alt="Home" height="60px" />
                    </li>
                    <li onClick={handleMeClick}>
                        <img src="/images/user.svg" alt="Me" height="60px" />
                    </li>
                </ul>
            </header>
            <p className='back'></p>
            {searchInput && (
                <div className='searchResultsBg' onClick={handleSearchResultsBgClick}>
                    <div className='searchResults' onClick={(e) => e.stopPropagation()}>
                        <p>Search Results</p>
                        {resultsData?.search?.nameResponse && (
                            <div className=''>
                                {resultsData?.search?.nameResponse.length >= 1 && <h3>Name Response</h3>}
                                {resultsData.search.nameResponse.map((user: NameResponse) => (
                                    <div className='searchResult' key={user.id}>
                                        <img src={user.profileImage} alt={`${user.username}'s profile`} />
                                        <p>{user.firstName} {user.lastName}</p>
                                        <p style={{color: "purple"}} onClick={()=>{navigate(`/user/${user.id}`); setSearchInput("")}}> @{user.username}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {resultsData?.search?.usernameResponse && (
                            <div className=''>
                                {resultsData?.search?.usernameResponse.length >= 1 && <h3>Username Response</h3>}
                                {resultsData.search.usernameResponse.map((user: UsernameResponse) => (
                                    <div className='searchResult' key={user.id}>
                                        <img src={user.profileImage} alt={`${user.username}'s profile`} />
                                        <p>{user.firstName} {user.lastName}</p>
                                        <p style={{color: "purple"}} onClick={()=>{navigate(`/user/${user.id}`); setSearchInput("")}}>@{user.username}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {resultsData?.search?.companyResponse && (
                            <div className=''>
                                {resultsData?.search?.companyResponse.length >= 1 && <h3>Company Response</h3>}
                                {resultsData.search.companyResponse.map((user: CompanyResponse) => (
                                    <div className='searchResult' key={user.id}>
                                        <img src={user.profileImage} alt={`${user.username}'s profile`} />
                                        <p>{user.firstName} {user.lastName}</p>
                                        <p style={{color: "purple"}} onClick={()=>{navigate(`/user/${user.id}`); setSearchInput("")}}> @{user.username}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {(!resultsData?.search?.nameResponse && !resultsData?.search?.usernameResponse && !resultsData?.search?.companyResponse) && (
                            <p>No results found</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}