import Image from "next/image";

type Props = {
  className?: string;
  priority?: boolean;
};

/** Illustration when la entrevista no puede cargarse (micrófono / conexión). */
export default function EntrevistaLoadErrorIllustration({
  className = "h-auto w-full max-w-xs sm:max-w-md",
  priority,
}: Props) {
  return (
    <Image
      src="/entrevista-load-error.png"
      alt="Ilustración de error: dos pájaros en una azoteja con un micrófono y el cable roto al atardecer."
      width={1024}
      height={682}
      className={className}
      priority={priority}
    />
  );
}
