import React, { useEffect, useState } from "react";
import {
  ServerCrash,
  Activity,
  Wrench,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BellRing } from "lucide-react";

const steps = [
  {
    icon: ServerCrash,
    title: "ARMS is Retiring",
    copy: "The university is officially shifting all records and portals from ARMS to the new V-Study system. ARMS is being phased out.",
  },
  {
    icon: Activity,
    title: "SaveethaAM is Impacted",
    copy: "Because our calculator relies heavily on syncing with the ARMS portal, the recent university changes have caused our auto-sync features to break.",
  },
  {
    icon: Wrench,
    title: "We are Building for V-Study",
    copy: "We are working hard behind the scenes to make SaveethaAM fully compatible with the new V-Study portal. A major update is coming!",
  },
  {
    icon: Users,
    title: "A Community Effort",
    copy: "We've put a lot of work into this project as a community. Let's meet soon if possible to discuss the future of SaveethaAM!",
  },
];

export default function TransitionModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Pop up every time the user opens
    const timer = setTimeout(() => {
      setOpen(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-neutral-950 p-0 overflow-y-auto max-h-[90vh] sm:rounded-2xl">
          <div className="flex w-full justify-center bg-white dark:bg-neutral-950 px-6 py-10 text-neutral-900 dark:text-neutral-100">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-10 text-center sm:text-left">
              <Badge variant="outline" className="mb-4 text-indigo-600 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800">
                Important Update
              </Badge>
              <DialogTitle className="text-2xl font-bold tracking-tight sm:text-3xl mb-2">
                University Portal Transition
              </DialogTitle>
              <p className="mt-3 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
                The ARMS portal is changing, and we are adapting with it. Here is what you need to know about the future of SaveethaAM.
              </p>
            </div>

            <ol className="flex flex-col">
              {steps.map(({ icon: Icon, title, copy }, index) => {
                const isLast = index === steps.length - 1;
                return (
                  <li key={title} className="flex gap-4 sm:gap-6">
                    <div className="flex flex-col items-center">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-sm">
                        <Icon
                          className="size-4.5"
                          aria-hidden="true"
                        />
                      </span>
                      {!isLast && <span className="mt-2 w-px flex-1 bg-neutral-200 dark:bg-neutral-800" />}
                    </div>

                    <div className={isLast ? "pb-0 pt-1" : "pb-8 pt-1"}>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
                      <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{copy}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            
            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
              <Button 
                onClick={() => setOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
              >
                Got it, thanks!
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {!open && (
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
        className="fixed z-50 shadow-lg rounded-full px-4 py-6"
        style={{ bottom: '9rem', right: '1rem' }}
      >
        <BellRing size={20} className="mr-2" />
        Important Update
      </Button>
    )}
  </>
  );
}
