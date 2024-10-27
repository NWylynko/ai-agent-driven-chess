
interface MoveIndicatorProps {
  isCapture: boolean;
}

export function MoveIndicator({ isCapture }: MoveIndicatorProps) {
  if (isCapture) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full rounded-full border-4 border-red-500/50 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-4 h-4 rounded-full bg-green-500/50 animate-pulse"></div>
    </div>
  );
}