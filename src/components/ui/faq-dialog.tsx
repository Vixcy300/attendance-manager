import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield } from "lucide-react";

export function FaqDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-full px-6 text-neutral-600 border-neutral-300">
          <Shield size={16} /> Privacy & Security FAQ
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:hidden bg-white">
        <ScrollArea className="flex max-h-full flex-col">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="px-6 pt-6 text-neutral-900">Security & Privacy (FAQ)</DialogTitle>
            <DialogDescription asChild>
              <div className="p-6">
                <div className="space-y-6 [&_strong]:font-semibold [&_strong]:text-neutral-900 text-neutral-600 text-sm leading-relaxed">
                  
                  <div className="space-y-1">
                    <p>
                      <strong>How is my data stored?</strong>
                    </p>
                    <p>
                      All attendance logs, calculations, and cached schedules are stored securely. We do not store your raw Saveetha portal passwords in plain text. Any credentials required for automated scraping are encrypted using AES-256 before being stored in the database.
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p>
                      <strong>Is my data shared with third parties?</strong>
                    </p>
                    <p>
                      No. We strictly believe that your academic data is yours alone. We do not sell, rent, or share your attendance information, email address, or any personal details with any third parties or advertisers.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p>
                      <strong>Are the daily email reports secure?</strong>
                    </p>
                    <p>
                      Yes! The daily smart checking service uses an automated secure chron job that runs at 5:00 PM. The email reports containing your live attendance status are dispatched over encrypted TLS connections (via Nodemailer) directly to your registered email address.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p>
                      <strong>How is the live portal sync handled?</strong>
                    </p>
                    <p>
                      When you initiate a live portal sync, our servers act as a secure proxy to fetch data directly from `arms.sec.saveetha.com`. The connection between our server and the university portal is established over HTTPS, ensuring data integrity during transit.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p>
                      <strong>What happens if I delete my account?</strong>
                    </p>
                    <p>
                      When you delete your account, all associated data, including your cached attendance records, encrypted credentials, and profile settings, are permanently wiped from our servers immediately. We do not retain backup copies of deleted user accounts.
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p>
                      <strong>Is this application officially affiliated with Saveetha?</strong>
                    </p>
                    <p>
                      No, Saveetha Attendance Manager is an independent project built by students, for students. It is designed to be a reliable and beautiful companion to the official portal, but it is not officially endorsed or managed by Saveetha University.
                    </p>
                  </div>

                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-6 pb-6 sm:justify-start">
            <DialogClose asChild>
              <Button type="button" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">
                Understood
              </Button>
            </DialogClose>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
