function Searchbar(props) {
    return(
        <div className="flexbox">
            <div className="search">
                <div>
                    <input type="text" placeholder="Search for a card..." 
                        onChange={(e) => props.setQuery(e.target.value)} value={props.query} />

                    <button onClick={() => props.searchCard()}>Go</button>
                </div>
            </div>
        </div>
    )
}

export default Searchbar