const getAssetSrc = (asset) => {
  if (typeof asset === 'string') return asset;
  if (asset?.src) return asset.src;
  if (asset?.default?.src) return asset.default.src;
  if (asset?.default) return asset.default;
  return '';
};

export const StoryImage = ({ src, alt, width, height, style, className }) => {
  const resolvedSrc = getAssetSrc(src);
  const imgWidth = typeof width === 'number' && width > 0 ? width : undefined;
  const imgHeight = typeof height === 'number' && height > 0 ? height : undefined;

  return <img src={resolvedSrc} alt={alt} width={imgWidth} height={imgHeight} style={style} className={className} loading="lazy" />;
};