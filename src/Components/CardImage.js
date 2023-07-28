function CardImage(props) {
    return(
        <img src={props.image} alt={props.image} className="cardImage" draggable="true" 
            onDragStart={(image) => props.drag(image)} name={props.name} />
    )
}

export default CardImage