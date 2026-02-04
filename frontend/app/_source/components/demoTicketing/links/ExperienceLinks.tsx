import NTicket from "./NTicket";
import YTicket from "./YTicket";
import MTicket from "./MTicket";

export default function ExperienceLinks() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full mt-4 sm:mt-8">
      <NTicket />
      <YTicket />
      <MTicket />
    </div>
  );
}
