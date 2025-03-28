import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { createStyles } from '@nocobase/client';
import { isArray } from 'lodash';

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      display: flex;
      align-items: center;
      width: 100%;
      /* height: 60px; */
      background-color: orange;
    `,
  };
});

export interface IImageScrollerProps {
  images: Array<string>;
}

const ImageScroller: React.FC<IImageScrollerProps> = observer((props) => {
  const { images } = props;
  const { styles } = useStyles();

  useEffect(() => {
    //
  }, [images]);

  const renderImages = () => {
    // return;
    if (!isArray(images)) return;

    return images.map((it, idx) => (
      <div key={idx}>
        <img src={it} />
      </div>
    ));
  };

  return <div className={styles.container}>{renderImages()}</div>;
});

ImageScroller.displayName = 'ImageScroller';

export default ImageScroller;
