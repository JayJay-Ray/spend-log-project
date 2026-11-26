export default function Skeleton({
  width,
  height,
  className = '',
  count = 1,
}) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <span
          className={`skeleton ${className}`.trim()}
          key={index}
          style={{ width, height }}
          aria-hidden="true"
        />
      ))}
    </>
  )
}
