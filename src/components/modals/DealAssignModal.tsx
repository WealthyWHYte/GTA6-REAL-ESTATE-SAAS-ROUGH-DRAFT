// src/components/modals/DealAssignModal.tsx
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function DealAssignModal({ triggerText = "💼 Assign Deal" }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    // Here you could POST to backend / webhook / Apollo / CRM
    console.log({ name, email, reason });
    setOpen(false);
    setName("");
    setEmail("");
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-neon-pink">{triggerText}</Button>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <h2 className="text-xl font-bold">Assign This Deal</h2>
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter buyer's name" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter buyer's email" />
        </div>
        <div className="space-y-2">
          <Label>Reason / Notes</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for assignment..." />
        </div>
        <Button className="w-full" onClick={handleSubmit}>
          🚀 Assign Deal
        </Button>
      </DialogContent>
    </Dialog>
  );
}
