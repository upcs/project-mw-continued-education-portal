
import React, {useState} from 'react';
import { Link } from 'react-router-dom';

function SearchBar() {
    const [input, setInput] = useState('');

    return (
        <>
            <div className="searchBarContainer">
                <div className="search-bar">
                    <input type="search" placeholder="Search..."/>
                </div>

                <div className="searchButton">
                    <Link to = "/results" className='searchButton'>
                        <button type="submit" className='searchButton'>Search</button>
                    </Link>
                </div>
            </div>
        </>
    )
}

export default SearchBar