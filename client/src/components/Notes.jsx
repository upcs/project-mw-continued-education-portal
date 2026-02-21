import '../css/Notes.css';

function Notes(){
  return (
    <section className="sidebar">
      <h2>Notes</h2>
      <textarea 
        className="notes-textarea"
        placeholder="Text box to take notes..."
      ></textarea>
    </section>
  );
}

export default Notes;