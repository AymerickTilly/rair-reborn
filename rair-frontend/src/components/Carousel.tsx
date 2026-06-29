import { Carousel, Modal, Button } from 'react-bootstrap';
import { useState } from 'react';
import './Hover.css';
import '../components/Homestyling.css';
/*import { useAuthStore } from '../auth/AuthStore';*/

type Slide = {
  image: string;
  alt: string;
  title: string;
  text: string;
  productId: string;
};

type CarouselComponentProps = {
  slides: Slide[];
};

const CarouselComponent = ({ slides }: CarouselComponentProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);

  const handleSlideClick = (slide: Slide) => {
    setSelectedSlide(slide);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  return (
    <>
      <div className="carousel-card-wrapper">
        <div className="carousel-card">
          <Carousel
            className="mb-4"
            style={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}
          >
            {slides.map((slide) => (
              <Carousel.Item
                key={slide.productId}
                onClick={() => handleSlideClick(slide)}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                <img
                  className="d-block w-100"
                  src={slide.image}
                  alt={slide.alt}
                  style={{ zIndex: 1, position: 'relative' }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      </div>

      <Modal show={showModal} onHide={handleClose} centered dialogClassName="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>{selectedSlide?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSlide && (
            <>
              <img
                src={selectedSlide.image}
                alt={selectedSlide.alt}
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  borderRadius: '4px',
                }}
              />
              <p className="mt-3">{selectedSlide.text}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CarouselComponent;
