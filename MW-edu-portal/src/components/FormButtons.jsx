
import Button from "./Button.jsx";

function ButtonRow()
{
    return (
        <>
            <div className="form-button-container">
                <div><Button text = "Form 1"/></div>
                <div><Button text = "Form 2"/></div>
                <div><Button text = "Form 3"/></div>
                <div><Button text = "Form 4"/></div>
            </div>
        </>
    )
}

export default ButtonRow;