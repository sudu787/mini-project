import React from 'react';
import useLazyLoad from '../hooks/useLazyLoad';

const Image = ({ src, alt, placeholder }) => {
  const [ref, inView] = useLazyLoad({ threshold: 0.1 });

  return (
    <div ref={ref} style={{ minHeight: '200px' }}>
      {inView ? <img src={src} alt={alt} /> : <img src={placeholder} alt="placeholder" />}
    </div>
  );
};

export default Image;
