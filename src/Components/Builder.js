import Searchbar from "./Searchbar"
import {useState, useEffect} from "react"
import CardImage from "./CardImage"
// TODO: add deletion via drag and drop
function Builder() {
    const [imageNamePairs, setImageNamePairs] = useState([])
    const [chosenCard, setChosenCard] = useState(null)
    const [deck, setDeck] = useState([])
    const [cardsAdded, setCardsAdded] = useState(0)
    const [query, setQuery] = useState("")
    const [energies, setEnergies] = useState(new Set())
    const [hasRadiantCard, setHasRadiantCard] = useState(false)

    useEffect(() => {
        async function getEnergies() {
            let request = await fetch("https://api.pokemontcg.io/v2/cards?q=supertype:Energy")
            let json = await request.json()
            let energySet = new Set()
            for (let cardName of json["data"])
                energySet.add(cardName["name"])
            setEnergies(energySet)
        }

        getEnergies();
    }, [])
    function allowDrop(ev) {
        ev.preventDefault();
    }
      
    function dragAdd(image) {
        setChosenCard([image.target.src, image.target.name])
    }

    function dragOff(image) {
        setChosenCard([image.target.src, image.target.name])
    }
    function hasFourCopies(cardToAdd=null) {
        // have an optional card parameter to get the most recent cardName
        if (cardToAdd === null) cardToAdd = chosenCard
        // if the chosen card is an energy, skip this function
        if ((energies.has(cardToAdd[1]))) return false

        let cardCount = 0
        for (let card of deck) { 
            // check  if name of card matches name of chosenCard
            console.log(card[1], cardToAdd)
            if (card[1] === cardToAdd) {
                cardCount += 1
                if (cardCount === 4) return true
            }
        }

        console.log(cardCount)
        return false
    }
    
    function cleanChosenCardName() {
        let parenIndex = chosenCard[1].indexOf("(")

        if (parenIndex === -1) return chosenCard[1] // no other variants found of the card

        let cleanedCardName = chosenCard[1].slice(0, parenIndex - 1)
        setChosenCard(chosenCard[0], cleanedCardName)
        return cleanedCardName
    }

    function drop() {
        // check how many times the card occurs in deck, can't have > 4 copies of any card
        let cardName = cleanChosenCardName()
        if (hasFourCopies(cardName)) return;

        // check if deck has a radiant card, and that this card is radiant
        console.log(chosenCard[1])
        if (hasRadiantCard && chosenCard[1].indexOf("Radiant") !== -1) return

        let newDeck = [...deck]
        // chosenCard is a two element array of image and name
        // process the name of chosenCard so there are no duplicates with the same name but diff artwork
        newDeck.push([chosenCard[0], cardName, cardsAdded])
        setDeck(newDeck)
        setCardsAdded(cardsAdded + 1)
        setHasRadiantCard(true)
    }

    function deleteCard() {
        let newDeck = [...deck]
        console.log("Chosen card: " + chosenCard[1])
        let cardIndex = 0

        // get the index of the chosenCard to delete
        for (let card of newDeck) {
            if (card[0] === chosenCard[0] && card[1] === chosenCard[1]) 
                break
            cardIndex += 1
        }

        newDeck.splice(cardIndex, 1)
        setDeck(newDeck)
        // check if this card is radiant
        if (chosenCard[1].indexOf("Radiant") !== -1) setHasRadiantCard(false)
    }

    // returns a hashmap where elements of array are keys and values are the count in array
    function getCounts(arrayOfCards) {
        let count = {};
        for (let imageNamePair of arrayOfCards) { 
            let cardName = imageNamePair[1]
            if (cardName in count)
                count[cardName] += 1 
            else
                count[cardName] = 1
        }
        return count;      
    }

    async function searchCard(latestQuery=null) { 
        // latestQuery: optional param used to get the latest state of query when needed
        if (latestQuery == null) latestQuery = query

        let processedQuery = "\"" + latestQuery + "\"" // add quotes to start and end of query
        let request = await fetch(`http://localhost:5000/search?query=${processedQuery}`)
        let json = await request.json()
        let imageNamePairs = []

        for (let i = 0; i < json["images"].length; i++) 
            imageNamePairs.push([json["images"][i], json["names"][i]])

        setImageNamePairs(imageNamePairs)
    }

    async function getRecommendation() {
        let response = await fetch("http://localhost:5000/allCards")
        let allCards = await response.json()
        allCards = allCards['cards'] // get cards from json response

        let deckArray = getDeckArray(allCards)
        response = await fetch(`http://localhost:5000/recommend?deck=${deckArray}`)
        let json = await response.json()

        // search for the most recommended card
        setQuery(json["recommendations"][0][0])
        searchCard(json["recommendations"][0][0])
    }

    function getDeckArray(allCards) { 
        // turn array into a series of numbers from 0-4 corresponding to how many copies are in the deck of each card
        let counter = getCounts(deck)
        let array = []
        
        for (let card of allCards) {
            if (card in counter)
                array.push(counter[card])
            else    
                array.push(0)
        }
        return array
    }
      
    return( 
        <div>
            <Searchbar setImageNamePairs={setImageNamePairs} query={query} setQuery={setQuery} 
                searchCard={searchCard} />
            <div className="wrapper">
                <div className="one" id="addSide" onDragOver={(e) => allowDrop(e)} 
                    onDrop={() => deleteCard()}>
                    <h1>Cards</h1>
                    {
                        imageNamePairs.map((imageNamePair) => 
                            <CardImage image={imageNamePair[0]} drag={dragAdd} name={imageNamePair[1]} 
                                key={imageNamePair[0]} />)
                    }
                </div>

                <div className="two" id="deckSide" onDragOver={(e) => allowDrop(e)} 
                    onDrop={() => drop()}>

                    <h1>Deck ({deck.length})</h1>
                    <button onClick={() => getRecommendation()}>Recommend a card</button>

                    {deck.map(imageNamePair => (<CardImage image={imageNamePair[0]} 
                        drag={dragOff} name={imageNamePair[1]} key={imageNamePair[2]} />))}
                </div>
            </div>
        </div>
    )
}   
export default Builder