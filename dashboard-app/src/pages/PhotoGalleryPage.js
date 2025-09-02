import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Annotation from '../components/Annotation';
import { submitAnnotation } from '../services/annotationService';
import './PhotoGalleryPage.css';

const PhotoGalleryPage = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const mockImages = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      thumbnailUrl: `https://picsum.photos/id/${i + 10}/200/200`,
      fullUrl: `https://picsum.photos/id/${i + 10}/600/400`,
    }));
    setImages(mockImages);
  }, []);

  const handleAnnotationSubmit = async (annotation) => {
    const annotationData = {
      imageId: selectedImage.id,
      ...annotation,
    };
    const response = await submitAnnotation(annotationData);
    console.log(response);
  };

  return (
    <div>
      <h2>Photo Gallery</h2>
      <div className="photo-grid">
        {images.map((image) => (
          <div key={image.id} className="photo-item" onClick={() => setSelectedImage(image)}>
            <img src={image.thumbnailUrl} alt={`Thumbnail ${image.id}`} />
          </div>
        ))}
      </div>

      {selectedImage && (
        <Modal onClose={() => setSelectedImage(null)}>
          <Annotation onAnnotationSubmit={handleAnnotationSubmit}>
            <img src={selectedImage.fullUrl} alt={`Full-sized ${selectedImage.id}`} style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </Annotation>
        </Modal>
      )}
    </div>
  );
};

export default PhotoGalleryPage;
