import { InstagramIcon } from "@/components/ui/icons";
import { SmartLink } from "@/components/ui/SmartLink";
import { cn } from "@/lib/cn";
import { instagramUrl } from "@/lib/format";

type InstagramLinkProps = {
  handle: string;
  /** `handle` shows the icon and "@tasteofchaska"; `label` the word "Instagram". */
  display: "handle" | "label";
  className?: string;
};

/** The kitchen's Instagram profile, which the design links from every page. */
export function InstagramLink({ handle, display, className }: InstagramLinkProps) {
  return (
    <SmartLink
      href={instagramUrl(handle)}
      className={cn(
        "no-underline",
        display === "handle" && "inline-flex items-center gap-1.5",
        className,
      )}
    >
      {display === "handle" ? (
        <>
          <InstagramIcon />@{handle}
        </>
      ) : (
        "Instagram"
      )}
    </SmartLink>
  );
}
