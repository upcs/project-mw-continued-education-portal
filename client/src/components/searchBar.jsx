
import React, {useState} from 'react';

function SearchBar() {
    const [input, setInput] = useState('');

    return (
        <>
            <div className="searchBarContainer">
                <div className="search-bar">
                    <input type="search" placeholder="Search..."/>
                </div>

                <div className="searchButton">
                    <button type="submit" className='searchButton'>Search</button>
                </div>
            </div>
        </>
    )
}

export default SearchBar