import Image from "next/image";
import type { ReactNode } from "react";

type PageHeadingWithIconProps = {
  iconSrc: string;
  title: string;
  subtitle?: ReactNode;
  className?: string;
  titleClassName?: string;
  priority?: boolean;
};

export default function PageHeadingWithIcon({
  iconSrc,
  title,
  subtitle,
  className = "",
  titleClassName = "page-heading mb-2 sm:mb-3",
  priority = false,
}: PageHeadingWithIconProps) {
  return (
    <div className={`page-title-with-icon ${className}`.trim()}>
      <div className="min-w-0 flex-1">
        <h1 className={titleClassName}>{title}</h1>
        {subtitle ? (
          <p className="text-brand-muted text-pretty">{subtitle}</p>
        ) : null}
      </div>
      <span className="page-heading-icon-well" aria-hidden>
        <Image
          src={iconSrc}
          width={1254}
          height={1254}
          alt=""
          className="page-heading-icon"
          priority={priority}
        />
      </span>
    </div>
  );
}
