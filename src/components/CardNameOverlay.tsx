type Props = {
  name: string;
};

export function CardNameOverlay({ name }: Props) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1.5 backdrop-blur-[1px]">
      <p className="truncate text-center text-xs font-medium leading-tight text-white">
        {name}
      </p>
    </div>
  );
}
