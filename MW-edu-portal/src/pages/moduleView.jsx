
import './moduleView.css'

import Header from '../components/Header';
import NavigationBar from '../components/NavigationBar';
import Notes from '../components/Notes';
import ContentViewer from '../components/ContentViewer';
import Tags from '../components/Tags';
import Footer from '../components/Footer';

function moduleView(){
  return (
    <div className="page-bg">
      <div className="app-wrapper">
        <Header />
        <NavigationBar />
        
        <main className="main-content">
          <Notes />
          <ContentViewer />
          <Tags />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default App;