import React, { useEffect, useState } from 'react';
import './AdsList.css';
import Spinner from './Spinner';
interface Ad {
  title: string;
  imageurl: string;
}

const AdsList: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 9;

  useEffect(() => {
    console.log('i fire once');
    const fetchData = async () => {
      try {
        const startTime = performance.now();

        const response = await fetch('http://localhost:3001/api/scrape');
        const data = await response.json();

        setAds(data);
        setLoading(false);

        const endTime = performance.now();
        const elapsedTimeInSeconds = (endTime - startTime) / 1000;
        console.log(`Time taken to display data: ${elapsedTimeInSeconds} seconds`);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const indexOfLastAd = currentPage * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = ads.slice(indexOfFirstAd, indexOfLastAd);

  const paginate = (pageNumber: number) => {
    const adsList = document.querySelector('.ads-list') as HTMLElement;

    if (adsList) {
      adsList.style.opacity = '0';

      setTimeout(() => {
        setCurrentPage(pageNumber);
        adsList.style.opacity = '1';
      }, 300);
    }
  };


const renderPaginationButtons = () => {
  const totalPages = Math.ceil(ads.length / adsPerPage);

  if (totalPages <= 1) {
    return null;
  }

  const buttons = [];
  const maxButtonsToShow = 5; 

  buttons.push(
    <button key="first" onClick={() => paginate(1)} disabled={currentPage === 1}>
      {'<<<'}
    </button>
  );

  buttons.push(
    <button key="prev" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
      {'<'}
    </button>
  );

  const halfMaxButtons = Math.floor(maxButtonsToShow / 2);
  let minButton = Math.max(1, currentPage - halfMaxButtons);
  const maxButton = Math.min(totalPages, minButton + maxButtonsToShow - 1);

  if (maxButton - minButton + 1 < maxButtonsToShow) {
    minButton = Math.max(1, maxButton - maxButtonsToShow + 1);
  }

  for (let i = minButton; i <= maxButton; i++) {
    buttons.push(
      <button key={i} onClick={() => paginate(i)} className={i === currentPage ? 'active' : ''}>
        {i}
      </button>
    );
  }

  buttons.push(
    <button key="next" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
      {'>'}
    </button>
  );

  buttons.push(
    <button key="last" onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}>
      {'>>>'}
    </button>
  );

  return buttons;
};
const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner">
    Loading...
  </div>
);

  return (
    <div className="ads-list-container">
      <h1>Available Properties</h1>

      {loading ? (
        <Spinner /> 
      ) : (
        <div>
          <ul className="ads-list">
            {currentAds.map((ad, index) => (
              <li key={index} className="ad-item">
                <img src={ad.imageurl} alt={ad.title} className="ad-image" />
                <p className="ad-title">{ad.title}</p>
              </li>
            ))}
          </ul>

          <div className="pagination">
            {renderPaginationButtons()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsList;
