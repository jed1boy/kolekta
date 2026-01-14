"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Download,
  Trash2,
  Monitor,
  Moon,
  Sun,
  Key,
  Copy,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { client } from "@/lib/orpc";

interface ApiTokenItem {
  id: string;
  name: string | null;
  prefix: string;
  lastUsedAt: Date | string | null;
  createdAt: Date | string;
}

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

export function SettingsModal({
  open,
  onOpenChange,
  userEmail,
}: SettingsModalProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // API Token state
  const [tokens, setTokens] = useState<ApiTokenItem[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    try {
      setIsLoadingTokens(true);
      const data = await client.apiToken.list();
      setTokens(data);
    } catch {
      // Ignore errors silently
    } finally {
      setIsLoadingTokens(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchTokens();
    }
  }, [open, fetchTokens]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const bookmarks = await client.bookmark.export();

      const blob = new Blob([JSON.stringify(bookmarks, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kolekta-bookmarks-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Bookmarks exported successfully");
    } catch {
      toast.error("Failed to export bookmarks");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await client.user.delete({});
      toast.success("Account deleted successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to delete account");
      setIsDeleting(false);
    }
  };

  const handleGenerateToken = async () => {
    try {
      setIsGenerating(true);
      const result = await client.apiToken.generate({
        name: newTokenName || undefined,
      });
      setGeneratedToken(result.token);
      setNewTokenName("");
      fetchTokens();
      toast.success("API token generated");
    } catch {
      toast.error("Failed to generate token");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeToken = async (id: string) => {
    try {
      await client.apiToken.revoke({ id });
      setTokens((prev) => prev.filter((t) => t.id !== id));
      toast.success("Token revoked");
    } catch {
      toast.error("Failed to revoke token");
    }
  };

  const handleCopyToken = (token: string, id?: string) => {
    navigator.clipboard.writeText(token);
    if (id) {
      setCopiedTokenId(id);
      setTimeout(() => setCopiedTokenId(null), 2000);
    }
    toast.success("Copied to clipboard");
  };

  const handleCloseGenerateDialog = () => {
    setGenerateDialogOpen(false);
    setGeneratedToken(null);
    setNewTokenName("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your account settings and preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={theme}
                onValueChange={(val) => val && setTheme(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>System</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Account</Label>
              <Input value={userEmail} readOnly className="bg-muted" />
              <p className="text-[0.8rem] text-muted-foreground">
                This is the email address associated with your account.
              </p>
            </div>

            <div className="space-y-2">
              <Label>API Tokens</Label>
              <p className="text-[0.8rem] text-muted-foreground mb-2">
                Generate tokens to connect the Chrome extension.
              </p>
              <Button
                variant="outline"
                className="w-full justify-start transition-colors"
                onClick={() => setGenerateDialogOpen(true)}
              >
                <Key className="mr-2 h-4 w-4" />
                Generate API Token
              </Button>
              {isLoadingTokens ? (
                <div className="text-sm text-muted-foreground py-2">
                  Loading tokens...
                </div>
              ) : tokens.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {tokens.map((token) => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {token.name || "Unnamed token"}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {token.prefix}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-destructive transition-colors"
                          onClick={() => handleRevokeToken(token.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Button
                variant="outline"
                className="w-full justify-start transition-colors"
                onClick={handleExport}
                disabled={isExporting}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export Bookmarks"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-destructive">Danger Zone</Label>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="destructive"
                      className="w-full justify-start transition-colors"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteAccount();
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={generateDialogOpen} onOpenChange={handleCloseGenerateDialog}>
        <DialogPopup className="sm:max-w-sm">
          {generatedToken ? (
            <>
              <DialogHeader>
                <DialogTitle>API Token Generated</DialogTitle>
                <DialogDescription>
                  Copy your token now. You won&apos;t be able to see it again.
                </DialogDescription>
              </DialogHeader>
              <DialogPanel>
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      value={generatedToken}
                      readOnly
                      className="pr-10 font-mono text-xs bg-muted"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 transition-colors"
                      onClick={() => handleCopyToken(generatedToken)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Make sure to copy this token. It will only be shown once.
                  </p>
                </div>
              </DialogPanel>
              <DialogFooter variant="bare">
                <Button onClick={handleCloseGenerateDialog} className="transition-colors">Done</Button>
              </DialogFooter>
            </>
          ) : (
            <Form
              className="contents"
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerateToken();
              }}
            >
              <DialogHeader>
                <DialogTitle>Generate API Token</DialogTitle>
                <DialogDescription>
                  Create a token to connect the Chrome extension.
                </DialogDescription>
              </DialogHeader>
              <DialogPanel>
                <Field>
                  <FieldLabel>Name (optional)</FieldLabel>
                  <Input
                    placeholder="e.g., Chrome Extension"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    autoFocus
                  />
                </Field>
              </DialogPanel>
              <DialogFooter variant="bare">
                <DialogClose render={<Button variant="ghost" className="transition-colors" />}>
                  Cancel
                </DialogClose>
                <Button type="submit" disabled={isGenerating} className="transition-colors">
                  <Plus className="mr-2 h-4 w-4" />
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </DialogPopup>
      </Dialog>
    </>
  );
}
