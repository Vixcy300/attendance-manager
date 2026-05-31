import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils"; 

const items = [
  {
    id: "1",
    title: "What is SaveethaAM?",
    content:
      "SaveethaAM is a dedicated attendance management and simulation tool built specifically for students of Saveetha Engineering College. It acts as an intelligent companion that tracks your attendance logs, calculates how many classes you can bunk or must attend to stay safe, and keeps you prepared for exams without fear of the strict 80% portal requirement.",
  },
  {
    id: "2",
    title: "How to get started?",
    content:
      "To get started, simply sign up with your email, add your courses, and set your target attendance percentage. You can also try the features instantly using our Demo mode without creating an account.",
  },
  {
    id: "3",
    title: "Is my data secure?",
    content:
      "Absolutely. Your portal credentials are never stored in plain text. We encrypt them using advanced AES-256 encryption. Our databases are strictly guarded, and we never share, sell, or distribute your records, passwords, or personal details to any third-party services. Your data remains completely yours.",
  },
  {
    id: "4",
    title: "What are the analytics features?",
    content:
      "SaveethaAM provides visual representations of your attendance trends, interactive bunk/target simulators, and custom goal settings. You can instantly see your overall vs. individual course metrics, track your streaks, and use our smart calculators to run 'what-if' scenarios before making decisions to skip a class.",
  },
  {
    id: "5",
    title: "Daily Smart Checking",
    content:
      "Our background cron system securely logs into the portal daily at 5:00 PM to fetch updates. If it notices any change in your attendance (like a newly marked present or absent class), it performs automatic recalculations and emails you a clean, beautifully formatted summary report so you stay updated effortlessly.",
  },
  {
    id: "6",
    title: "Need help",
    content:
      "We are committed to helping you have a seamless experience. If you face any issues during syncing, find discrepancies in calculations, or want to suggest new features, you can contact us via our Contact Page or open an issue. We respond to student feedback and bug reports within 24 hours.",
  },
];

export function Accordion05() {
  return (
    <div className="w-full max-w-3xl mx-auto py-20 px-4">
      <Accordion type="single" defaultValue="5" collapsible className="w-full">
        {items.map((item) => (
          <AccordionItem value={item.id} key={item.id} className="last:border-b">
            <AccordionTrigger className="text-left pl-6 md:pl-14 overflow-hidden text-foreground/20 duration-200 hover:no-underline cursor-pointer data-[state=open]:text-primary [&>svg]:hidden py-6 md:py-8">
              <div className="flex flex-1 items-start gap-4">
                <p className="text-xs pt-2 md:pt-4">{item.id}</p>
                <h1
                  className={`uppercase relative text-center text-3xl md:text-5xl leading-tight md:leading-tight`}
                >
                  {item.title}
                </h1>
              </div>
            </AccordionTrigger>

            <AccordionContent className="text-muted-foreground pb-6 pl-6 md:px-20">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
