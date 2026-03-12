import SearchBar from '../components/searchBar.jsx'
import { Link } from 'react-router-dom';

function SearchResults() {
    return (
        <div className="search-results">
            
            <div className="search-results-header">
                <SearchBar/>
            </div>

            <div className='module'>
                <Link to="/module-view">
                    <h2>Module Title 1</h2>
                </Link>
                <p>Module description goes here. This is a brief overview of the module content.</p>
            </div>

        </div>
    );
}

export default SearchResults;