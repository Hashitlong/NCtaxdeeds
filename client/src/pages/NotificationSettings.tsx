import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Bell, Mail, Smartphone, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { NC_COUNTIES } from "@/const";
import { PageHeader } from "@/components/PageHeader";

export default function NotificationSettings() {
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [minBid, setMinBid] = useState("");
  const [maxBid, setMaxBid] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [frequency, setFrequency] = useState<"immediate" | "daily">("immediate");

  const { data: preferences, isLoading } = trpc.notifications.getPreferences.useQuery();
  
  const updateMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences saved");
    },
    onError: (error) => {
      toast.error(`Failed to save preferences: ${error.message}`);
    },
  });

  useEffect(() => {
    if (preferences) {
      if (preferences.counties) {
        try {
          setSelectedCounties(JSON.parse(preferences.counties));
        } catch (e) {
          setSelectedCounties([]);
        }
      }
      setMinBid(preferences.minBid?.toString() || "");
      setMaxBid(preferences.maxBid?.toString() || "");
      setEmailEnabled(preferences.emailEnabled === 1);
      setInAppEnabled(preferences.inAppEnabled === 1);
      setFrequency(preferences.frequency as "immediate" | "daily");
    }
  }, [preferences]);

  const handleSave = () => {
    updateMutation.mutate({
      counties: selectedCounties.length > 0 ? JSON.stringify(selectedCounties) : undefined,
      minBid: minBid ? parseInt(minBid) : undefined,
      maxBid: maxBid ? parseInt(maxBid) : undefined,
      emailEnabled,
      inAppEnabled,
      frequency,
    });
  };

  const toggleCounty = (county: string) => {
    setSelectedCounties(prev =>
      prev.includes(county)
        ? prev.filter(c => c !== county)
        : [...prev, county]
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Notification Settings" />
      <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notification Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure alerts for new tax deed properties matching your criteria
          </p>
        </div>

        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>Choose how you want to receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
              </div>
              <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">See alerts when you log in</p>
                </div>
              </div>
              <Switch checked={inAppEnabled} onCheckedChange={setInAppEnabled} />
            </div>

            <div className="space-y-2">
              <Label>Notification Frequency</Label>
              <Select value={frequency} onValueChange={(v: "immediate" | "daily") => setFrequency(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate (as properties are added)</SelectItem>
                  <SelectItem value="daily">Daily Digest (once per day)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Filter Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Criteria</CardTitle>
            <CardDescription>Only notify me about properties matching these filters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* County Selection */}
            <div className="space-y-3">
              <Label>Counties ({selectedCounties.length} selected)</Label>
              <p className="text-sm text-muted-foreground">
                Leave empty to receive alerts for all counties
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto border rounded-md p-4">
                {NC_COUNTIES.map(county => (
                  <label key={county} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCounties.includes(county)}
                      onChange={() => toggleCounty(county)}
                      className="rounded"
                    />
                    <span className="text-sm">{county}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bid Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Bid</Label>
                <Input
                  type="number"
                  placeholder="No minimum"
                  value={minBid}
                  onChange={(e) => setMinBid(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Bid</Label>
                <Input
                  type="number"
                  placeholder="No maximum"
                  value={maxBid}
                  onChange={(e) => setMaxBid(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateMutation.isPending} size="lg">
            {updateMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
