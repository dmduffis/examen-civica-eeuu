import Image from "next/image";

type Props = {
  className?: string;
  priority?: boolean;
};

/** Illustración cuando el modo Repasar no puede cargar las preguntas. */
export default function RepasarLoadErrorIllustration({
  className = "h-auto w-full max-w-md",
  priority,
}: Props) {
  return (
    <Image
      src="/repasar-load-error.png"
      alt="Ilustración de error: un águila calva rasga un papel frente a monumentos de Washington D.C."
      width={1024}
      height={723}
      className={className}
      priority={priority}
    />
  );
}
