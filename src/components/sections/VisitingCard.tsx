import { Kicker } from "@/components/ui/Kicker";
import { SmartLink } from "@/components/ui/SmartLink";
import type { Site } from "@/content/schema";
import { mailtoHref, telHref } from "@/lib/format";

type VisitingCardProps = {
  site: Site;
  kicker: string;
  hoursLabel: string;
  contactLabel: string;
};

/** Hours and contact, side by side, beside the home catering notice. */
export function VisitingCard({
  site,
  kicker,
  hoursLabel,
  contactLabel,
}: VisitingCardProps) {
  const { hours, contact } = site;

  return (
    <div className="py-7">
      <Kicker className="mb-3">{kicker}</Kicker>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-card">
        <div>
          <Kicker as="h3" tone="ink" size="label" className="mb-1.5 leading-[25px]">
            {hoursLabel}
          </Kicker>
          <p>
            {hours.displayDays}
            <br />
            {hours.displayTime}
            <br />
            {hours.displayClosed}
          </p>
        </div>
        <div>
          <Kicker as="h3" tone="ink" size="label" className="mb-1.5 leading-[25px]">
            {contactLabel}
          </Kicker>
          <p>
            {/* The artboard only had "Dallas, Texas" because no real address
                existed yet. Both branches are kept so the block still reads
                correctly if the street line is ever cleared. */}
            {contact.address.street ? (
              <>
                {contact.address.street}
                <br />
                {contact.address.locality}, {contact.address.region}
                {contact.address.postalCode ? ` ${contact.address.postalCode}` : ""}
              </>
            ) : (
              <>
                {contact.address.locality}, {contact.address.regionName}
              </>
            )}
            <br />
            <SmartLink href={telHref(contact.phone.e164)} className="no-underline">
              {contact.phone.display}
            </SmartLink>
            <br />
            <SmartLink
              href={mailtoHref(contact.email.general)}
              className="break-all no-underline"
            >
              {contact.email.general}
            </SmartLink>
          </p>
        </div>
      </div>
    </div>
  );
}
