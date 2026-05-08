import Image from "next/image";

type Props = {
  className?: string;
  priority?: boolean;
};

export default function BrokenLinkIllustration({
  className = "h-auto w-full max-w-md",
  priority,
}: Props) {
  return (
    <Image
      src="/broken-link.png"
      alt="Ilustración de enlace roto: un cachorro con cadena rota, Casa Blanca y bandera de Estados Unidos."
      width={1024}
      height={723}
      className={className}
      priority={priority}
    />
  );
}
