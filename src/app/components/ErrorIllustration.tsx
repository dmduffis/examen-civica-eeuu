import Image from "next/image";

type Props = {
  className?: string;
  priority?: boolean;
};

/** Shared illustration for load / 404 / voice errors. */
export default function ErrorIllustration({
  className = "h-auto w-full max-w-[min(100%,340px)] sm:max-w-md object-contain",
  priority,
}: Props) {
  return (
    <Image
      src="/illustration_error.png"
      alt="Ilustración de error: una viajera con binoculares mira un mapa de Estados Unidos."
      width={1399}
      height={938}
      className={className}
      priority={priority}
    />
  );
}
