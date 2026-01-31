import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings2, Key, Bell, Database, Trash2 } from 'lucide-react';
import { useIPOStore } from '@/store/useIPOStore';

export default function Settings() {
  const { config, setConfig } = useIPOStore();

  return (
    <div className="animate-fade-in space-y-6 p-6 pt-16 lg:p-8 lg:pt-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground">
          Configure your IPO checker preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CAPTCHA Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              CAPTCHA Configuration
            </CardTitle>
            <CardDescription>
              Configure your CAPTCHA solving service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>CAPTCHA Service</Label>
              <Select 
                value={config.captchaService}
                onValueChange={(value: any) => setConfig({ captchaService: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2captcha">2Captcha API</SelectItem>
                  <SelectItem value="anticaptcha">Anti-Captcha</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <Input 
                type="password" 
                placeholder="Enter your API key..."
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored securely and never shared
              </p>
            </div>

            <Button variant="secondary" className="w-full">
              Verify API Key
            </Button>
          </CardContent>
        </Card>

        {/* Check Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Check Settings
            </CardTitle>
            <CardDescription>
              Default settings for new checks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Retry on failure</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically retry failed checks
                </p>
              </div>
              <Switch
                checked={config.retryOnFailure}
                onCheckedChange={(checked) => setConfig({ retryOnFailure: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-export results</Label>
                <p className="text-sm text-muted-foreground">
                  Download Excel after completion
                </p>
              </div>
              <Switch
                checked={config.autoExport}
                onCheckedChange={(checked) => setConfig({ autoExport: checked })}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Default delay (seconds)</Label>
              <Input 
                type="number" 
                value={config.delaySeconds}
                onChange={(e) => setConfig({ delaySeconds: parseInt(e.target.value) || 3 })}
                min={2}
                max={10}
              />
            </div>

            <div className="space-y-2">
              <Label>Max retries</Label>
              <Input 
                type="number" 
                value={config.maxRetries}
                onChange={(e) => setConfig({ maxRetries: parseInt(e.target.value) || 3 })}
                min={1}
                max={5}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Play sound when batch completes
                </p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Browser notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show desktop notifications
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage your stored data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total batches</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-sm text-muted-foreground">Total results</span>
                <span className="font-semibold">400</span>
              </div>
            </div>

            <Separator />

            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All History
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              This action cannot be undone
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
