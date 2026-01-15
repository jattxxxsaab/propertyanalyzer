import { useState } from 'react'
import './PhotoCarousel.css'

function PhotoCarousel({ photos }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!photos || photos.length === 0) {
    return null
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  const goToIndex = (index) => {
    setCurrentIndex(index)
  }

  return (
    <div className="photo-carousel">
      <div className="carousel-main">
        <button
          onClick={goToPrevious}
          className="carousel-button carousel-button-prev"
          aria-label="Previous photo"
        >
          &#8249;
        </button>

        <div className="carousel-image-container">
          <img
            src={photos[currentIndex]}
            alt={`Property photo ${currentIndex + 1}`}
            className="carousel-image"
          />
        </div>

        <button
          onClick={goToNext}
          className="carousel-button carousel-button-next"
          aria-label="Next photo"
        >
          &#8250;
        </button>

        <div className="carousel-counter">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>

      <div className="carousel-thumbnails">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            className={`thumbnail ${index === currentIndex ? 'thumbnail-active' : ''}`}
          >
            <img src={photo} alt={`Thumbnail ${index + 1}`} />
          </button>
        ))}
      </div>
    </div>
  )
}

export default PhotoCarousel
