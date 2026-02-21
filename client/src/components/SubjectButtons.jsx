
import Button from "./Button.jsx";

function ButtonRow()
{
    return (
        <>
            <div className="subject-button-container">
                <div><Button text = "Math"/></div>
                <div><Button text = "Science"/></div>
                <div><Button text = "English"/></div>
                <div><Button text = "History"/></div>

                <div><Button text = "Math"/></div>
                <div><Button text = "Science"/></div>
                <div><Button text = "English"/></div>
                <div><Button text = "History"/></div>
            </div>
        </>
    )
}

export default ButtonRow;