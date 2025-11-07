import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, MapPin, Calendar, DollarSign, FileText, User, Lock, Unlock, MessageSquare, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Property {
  id: number;
  county: string;
  parcelId: string;
  address: string | null;
  propertyType: string | null;
  owner: string | null;
  saleDate: Date | string | null;
  openingBid: number | null;
  currentBid: number | null;
  upsetBidCloseDate: Date | string | null;
  saleStatus: string | null;
  sourceUrl: string | null;
  firstScrapedAt: Date | string;
  lastUpdatedAt: Date | string;
  checkedOutBy: number | null;
  checkedOutAt: Date | string | null;
  arv: number | null;
  arvAddedBy: number | null;
  arvAddedAt: Date | string | null;
}

interface PropertyDetailDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyDetailDialog({ property, open, onOpenChange }: PropertyDetailDialogProps) {
  const { user } = useAuth();
  const [newNote, setNewNote] = useState("");
  const [arvInput, setArvInput] = useState("");
  const utils = trpc.useUtils();
  
  // Fetch notes for this property
  const { data: notes = [], refetch: refetchNotes } = trpc.propertyCollaboration.getNotes.useQuery(
    { propertyId: property?.id || 0 },
    { enabled: !!property?.id && open }
  );
  
  // Check-out mutation
  const checkOutMutation = trpc.propertyCollaboration.checkOut.useMutation({
    onSuccess: () => {
      toast.success("Property checked out");
      utils.properties.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to check out property");
    },
  });
  
  // Release mutation
  const releaseMutation = trpc.propertyCollaboration.release.useMutation({
    onSuccess: () => {
      toast.success("Property released");
      utils.properties.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to release property");
    },
  });
  
  // Add note mutation
  const addNoteMutation = trpc.propertyCollaboration.addNote.useMutation({
    onSuccess: () => {
      toast.success("Note added");
      setNewNote("");
      refetchNotes();
    },
    onError: () => {
      toast.error("Failed to add note");
    },
  });
  
  // Delete note mutation
  const deleteNoteMutation = trpc.propertyCollaboration.deleteNote.useMutation({
    onSuccess: () => {
      toast.success("Note deleted");
      refetchNotes();
    },
    onError: () => {
      toast.error("Failed to delete note");
    },
  });
  
  // Set ARV mutation
  const setARVMutation = trpc.propertyCollaboration.setARV.useMutation({
    onSuccess: () => {
      toast.success("ARV updated");
      setArvInput("");
      utils.properties.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to update ARV");
    },
  });
  
  if (!property) return null;
  
  const isCheckedOut = !!property.checkedOutBy;
  const isCheckedOutByMe = property.checkedOutBy === user?.id;
  const canCheckOut = !isCheckedOut || isCheckedOutByMe;

  const formatCurrency = (cents: number | null) => {
    if (!cents) return "Not available";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string | null) => {
    const statusValue = status || 'scheduled';
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "outline",
      in_upset_period: "default",
      sold: "secondary",
      cancelled: "destructive",
    };
    
    const labels: Record<string, string> = {
      scheduled: "Scheduled",
      in_upset_period: "Upset Period",
      sold: "Sold",
      cancelled: "Cancelled",
    };
    
    return (
      <Badge variant={variants[statusValue] || "outline"} className="text-sm">
        {labels[statusValue] || statusValue}
      </Badge>
    );
  };

  const getStatusDescription = (status: string | null) => {
    const descriptions: Record<string, string> = {
      scheduled: "This property is scheduled for auction but has not yet been sold.",
      in_upset_period: "This property has been sold but is in the 10-day upset bid period. Higher bids may be submitted.",
      sold: "This property has been sold and the upset bid period has ended.",
      cancelled: "This sale has been cancelled. The property may have been removed from foreclosure.",
    };
    return descriptions[status || 'scheduled'] || "Status unknown.";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">
                {property.address || "Address Not Available"}
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                {property.county} County • Parcel {property.parcelId}
              </DialogDescription>
            </div>
            {getStatusBadge(property.saleStatus)}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {getStatusDescription(property.saleStatus)}
            </p>
          </div>

          {/* Property Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Property Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{property.address || "Not available"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">County</p>
                <p className="font-medium">{property.county}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Parcel ID</p>
                <p className="font-mono text-sm">{property.parcelId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Property Type</p>
                <p className="font-medium">{property.propertyType || "Not specified"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Owner Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Owner Information
            </h3>
            <div>
              <p className="text-sm text-muted-foreground">Current Owner</p>
              <p className="font-medium">{property.owner || "Not available"}</p>
            </div>
          </div>

          <Separator />

          {/* Sale Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sale Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Sale Date</p>
                <p className="font-medium">{formatDate(property.saleDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upset Bid Close Date</p>
                <p className="font-medium">{formatDate(property.upsetBidCloseDate)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bid Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Bid Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Opening Bid</p>
                <p className="font-medium text-lg">{formatCurrency(property.openingBid)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Bid</p>
                <p className="font-medium text-lg text-primary">{formatCurrency(property.currentBid)}</p>
              </div>
            </div>
            {property.currentBid && property.openingBid && property.currentBid > property.openingBid && (
              <div className="mt-3 p-3 bg-primary/10 rounded-md">
                <p className="text-sm font-medium text-primary">
                  Bid increased by {formatCurrency(property.currentBid - property.openingBid)}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Data Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Data Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">First Scraped</p>
                <p>{formatDateTime(property.firstScrapedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p>{formatDateTime(property.lastUpdatedAt)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* ARV (After Repair Value) */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              After Repair Value (ARV)
            </h3>
            {property.arv ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(property.arv)}
                  </p>
                  {property.arvAddedAt && (
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Added {formatDateTime(property.arvAddedAt)}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentArv = property.arv ? (property.arv / 100).toString() : "";
                    setArvInput(currentArv);
                  }}
                >
                  Update ARV
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-3">
                No ARV set for this property yet
              </p>
            )}
            {(!property.arv || arvInput) && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      placeholder="Enter ARV"
                      value={arvInput}
                      onChange={(e) => setArvInput(e.target.value)}
                      className="pl-7"
                      min="0"
                      step="1000"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const arvValue = parseFloat(arvInput);
                      if (arvValue > 0) {
                        setARVMutation.mutate({
                          propertyId: property.id,
                          arv: Math.round(arvValue * 100), // convert to cents
                        });
                      }
                    }}
                    disabled={!arvInput || parseFloat(arvInput) <= 0 || setARVMutation.isPending}
                  >
                    Save
                  </Button>
                  {property.arv && arvInput && (
                    <Button
                      variant="outline"
                      onClick={() => setArvInput("")}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Check-Out Status */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              {isCheckedOut ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
              Property Status
            </h3>
            {isCheckedOut ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md mb-3">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  {isCheckedOutByMe ? "You have this property checked out" : "This property is checked out by a team member"}
                </p>
                {property.checkedOutAt && (
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Checked out {formatDateTime(property.checkedOutAt)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-3">
                This property is available for check-out
              </p>
            )}
            <div className="flex gap-2">
              {canCheckOut && (
                isCheckedOutByMe ? (
                  <Button
                    variant="outline"
                    onClick={() => releaseMutation.mutate({ propertyId: property.id })}
                    disabled={releaseMutation.isPending}
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    Release Property
                  </Button>
                ) : (
                  <Button
                    onClick={() => checkOutMutation.mutate({ propertyId: property.id })}
                    disabled={checkOutMutation.isPending}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Check Out Property
                  </Button>
                )
              )}
            </div>
          </div>

          <Separator />

          {/* Team Notes */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Team Notes ({notes.length})
            </h3>
            
            {/* Add Note Form */}
            <div className="mb-4">
              <Textarea
                placeholder="Add a note for your team..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="mb-2"
                rows={3}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (newNote.trim()) {
                    addNoteMutation.mutate({
                      propertyId: property.id,
                      note: newNote.trim(),
                    });
                  }
                }}
                disabled={!newNote.trim() || addNoteMutation.isPending}
              >
                Add Note
              </Button>
            </div>

            {/* Notes List */}
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notes yet. Be the first to add one!
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-muted rounded-md">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {note.userName || note.userEmail} • {formatDateTime(note.createdAt)}
                        </p>
                      </div>
                      {note.userName === user?.name && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNoteMutation.mutate({ noteId: note.id })}
                          disabled={deleteNoteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {property.sourceUrl && (
            <div className="pt-4">
              <Button asChild className="w-full">
                <a href={property.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on County Website
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
