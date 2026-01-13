"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronsUpDown, Plus, Check, Trash2 } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { type GroupItem } from "@/lib/schema";
import { SettingsModal } from "@/components/settings-modal";

interface HeaderProps {
  groups: GroupItem[];
  selectedGroup: GroupItem;
  onSelectGroup: (id: string) => void;
  onCreateGroup: (name: string) => void;
  onDeleteGroup?: (id: string) => void;
  userName: string;
  userEmail: string;
}

export function Header({
  groups,
  selectedGroup,
  onSelectGroup,
  onCreateGroup,
  onDeleteGroup,
  userName,
  userEmail,
}: HeaderProps) {
  const router = useRouter();
  const [newGroupName, setNewGroupName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [holdingGroupId, setHoldingGroupId] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartRef = useRef<number>(0);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim());
      setNewGroupName("");
      setDialogOpen(false);
    }
  };

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
    setHoldingGroupId(null);
    setHoldProgress(0);
  }, []);

  const startHold = useCallback(
    (groupId: string) => {
      if (groups.length <= 1) return;
      setHoldingGroupId(groupId);
      holdStartRef.current = Date.now();

      const updateProgress = () => {
        const elapsed = Date.now() - holdStartRef.current;
        const progress = Math.min((elapsed / 2000) * 100, 100);
        setHoldProgress(progress);

        if (progress >= 100) {
          onDeleteGroup?.(groupId);
          cancelHold();
        } else {
          holdTimerRef.current = setTimeout(updateProgress, 16);
        }
      };

      holdTimerRef.current = setTimeout(updateProgress, 16);
    },
    [groups.length, onDeleteGroup, cancelHold]
  );

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-2">
        <BmrksLogo />
        <span className="text-muted-foreground">/</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="rounded-xl"
            render={<Button variant="ghost" className="gap-2 px-2" />}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: selectedGroup.color }}
            />
            <span>{selectedGroup.name}</span>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-48 space-y-1 rounded-xl"
          >
            {groups.map((group) => (
              <DropdownMenuItem
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg",
                  group.id === selectedGroup.id && "bg-accent"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <span>{group.name}</span>
                </div>
                {group.id === selectedGroup.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {group.bookmarkCount ?? 0}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onClick={() => setDialogOpen(true)}
              className="rounded-lg w-full"
            >
              <Plus className="h-4 w-4 mr-0" />
              Create Group
            </DropdownMenuItem>
            {groups.length > 1 && (
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                onMouseDown={() => startHold(selectedGroup.id)}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={() => startHold(selectedGroup.id)}
                onTouchEnd={cancelHold}
                className="relative overflow-hidden text-destructive focus:text-destructive rounded-lg"
              >
                {holdingGroupId === selectedGroup.id && (
                  <div
                    className="absolute inset-0 bg-destructive/20"
                    style={{ width: `${holdProgress}%` }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  {holdingGroupId === selectedGroup.id
                    ? "Hold to delete..."
                    : "Delete Group"}
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogPopup className="sm:max-w-sm">
            <Form
              className="contents"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateGroup();
              }}
            >
              <DialogHeader>
                <DialogTitle>Create Group</DialogTitle>
                <DialogDescription>
                  Create a new group to organize your bookmarks.
                </DialogDescription>
              </DialogHeader>
              <DialogPanel>
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    placeholder="Enter group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    autoFocus
                  />
                </Field>
              </DialogPanel>
              <DialogFooter variant="bare">
                <DialogClose render={<Button variant="ghost" />}>
                  Cancel
                </DialogClose>
                <Button type="submit" disabled={!newGroupName.trim()}>
                  Create
                </Button>
              </DialogFooter>
            </Form>
          </DialogPopup>
        </Dialog>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-xl"
          render={<Button variant="ghost" className="gap-2 px-2" />}
        >
          <UserAvatar name={userName} />
          <span>{userName}</span>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl">
          <DropdownMenuItem
            className="rounded-lg"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg" onClick={handleSignOut}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        userEmail={userEmail}
      />
    </header>
  );
}

function BmrksLogo() {
  return (
    <span className="text-foreground font-medium" aria-label="Logo">
      kolekta
    </span>
  );
}

function UserAvatar({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" width="24" height="24">
      <rect width="32" height="32" rx="16" fill="#74B06F" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="500"
      >
        {name.charAt(0).toUpperCase()}
      </text>
    </svg>
  );
}
