import React, { useState, useRef } from 'react';
import './Annotation.css';

const Annotation = ({ children, onAnnotationSubmit }) => {
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState(null);
  const [label, setLabel] = useState('');
  const imageRef = useRef();

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setNewAnnotation({ x: offsetX, y: offsetY, width: 0, height: 0, label: '' });
  };

  const handleMouseMove = (e) => {
    if (!newAnnotation) return;
    const { offsetX, offsetY } = e.nativeEvent;
    setNewAnnotation((prev) => ({
      ...prev,
      width: offsetX - prev.x,
      height: offsetY - prev.y,
    }));
  };

  const handleMouseUp = () => {
    if (newAnnotation && (newAnnotation.width !== 0 || newAnnotation.height !== 0)) {
      // Don't save yet, wait for label
    } else {
      setNewAnnotation(null);
    }
  };

  const handleLabelSubmit = (e) => {
    e.preventDefault();
    const annotationToSave = { ...newAnnotation, label };
    setAnnotations([...annotations, annotationToSave]);
    if (onAnnotationSubmit) {
      onAnnotationSubmit(annotationToSave);
    }
    setNewAnnotation(null);
    setLabel('');
  };

  return (
    <div
      className="annotation-container"
      ref={imageRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {children}
      {annotations.map((ann, index) => (
        <div
          key={index}
          className="annotation-box"
          style={{
            left: ann.x,
            top: ann.y,
            width: ann.width,
            height: ann.height,
          }}
        >
          <span className="annotation-label">{ann.label}</span>
        </div>
      ))}
      {newAnnotation && !newAnnotation.label && (
        <div
          className="annotation-box"
          style={{
            left: newAnnotation.x,
            top: newAnnotation.y,
            width: newAnnotation.width,
            height: newAnnotation.height,
          }}
        >
          {newAnnotation.width !== 0 && (
            <form onSubmit={handleLabelSubmit} className="annotation-form">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter label"
                autoFocus
              />
              <button type="submit">Save</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Annotation;
