import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Slide } from '../types/Slide';
import './Homestyling.css';

type CarouselComponentProps = {
  slides: Slide[];
};

const CarouselComponent = ({ slides }: CarouselComponentProps) => {
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);

  if (!slides.length) return null;

  const prev = () => setIndex(i => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex(i => (i + 1) % slides.length);

  const current = slides[index];

  const open = (slide: Slide) => {
    setSelectedSlide(slide);
    setShowModal(true);
  };

  return (
    <>
      <div className="product-carousel">
        <button
          className="carousel-arrow"
          onClick={prev}
          disabled={slides.length <= 1}
          aria-label="Previous product"
        >
          ←
        </button>

        <button
          type="button"
          className="carousel-slide"
          onClick={() => open(current)}
          aria-label={`View ${current.title}`}
        >
          <img
            className="carousel-slide__img"
            src={current.image}
            alt={current.alt}
            width={440}
            height={400}
            loading="lazy"
          />
          <div className="carousel-slide__overlay" aria-hidden="true">
            <span className="carousel-slide__view">View</span>
          </div>
          <div className="carousel-slide__caption">
            <span className="carousel-slide__title">{current.title}</span>
            {slides.length > 1 && (
              <span className="carousel-slide__counter">{index + 1} / {slides.length}</span>
            )}
          </div>
        </button>

        <button
          className="carousel-arrow"
          onClick={next}
          disabled={slides.length <= 1}
          aria-label="Next product"
        >
          →
        </button>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        dialogClassName="rair-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedSlide?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSlide && (
            <>
              <img
                src={selectedSlide.image}
                alt={selectedSlide.alt}
                className="modal-img"
              />
              <p className="modal-desc">{selectedSlide.text}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CarouselComponent;
