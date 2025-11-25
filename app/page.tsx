"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { BookmarkInput } from "@/components/bookmark-input";
import { BookmarkList } from "@/components/bookmark-list";
import { parseColor, isUrl, normalizeUrl } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { client } from "@/lib/orpc";
import type { BookmarkType } from "@/lib/schema";

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionPending } = useSession();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionPending && !session) {
      router.push("/login");
    }
  }, [session, sessionPending, router]);

  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: () => client.group.list(),
    enabled: !!session,
  });

  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);

  const currentGroupId = selectedGroupId ?? groups[0]?.id ?? null;

  const bookmarksQuery = useQuery({
    queryKey: ["bookmarks", currentGroupId],
    queryFn: () =>
      client.bookmark.list({ groupId: currentGroupId ?? undefined }),
    enabled: !!session && !!currentGroupId,
  });

  const bookmarks = useMemo(
    () => bookmarksQuery.data ?? [],
    [bookmarksQuery.data]
  );

  const createBookmarkMutation = useMutation({
    mutationFn: (data: {
      title: string;
      url?: string;
      type: BookmarkType;
      color?: string;
      groupId: string;
    }) => client.bookmark.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  const updateBookmarkMutation = useMutation({
    mutationFn: (data: {
      id: string;
      title?: string;
      url?: string;
      type?: BookmarkType;
      color?: string;
      groupId?: string;
    }) => client.bookmark.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: (data: { id: string }) => client.bookmark.delete(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: { name: string; color: string }) =>
      client.group.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (data: { id: string }) => client.group.delete(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const selectedGroup =
    groups.find((g) => g.id === currentGroupId) || groups[0];

  const handleStartRename = (id: string) => {
    setRenamingId(id);
  };

  const handleFinishRename = () => {
    setRenamingId(null);
  };

  const handleDeleteBookmark = useCallback(
    (id: string) => {
      deleteBookmarkMutation.mutate({ id });
    },
    [deleteBookmarkMutation]
  );

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      if (!searchQuery) return true;
      return (
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.url?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [bookmarks, searchQuery]);

  const bookmarkCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bookmarks.forEach((b) => {
      counts[b.groupId] = (counts[b.groupId] || 0) + 1;
    });
    return counts;
  }, [bookmarks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (renamingId) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredBookmarks.length - 1)
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        return;
      }

      const activeIndex = hoveredIndex >= 0 ? hoveredIndex : selectedIndex;
      if (activeIndex < 0 || activeIndex >= filteredBookmarks.length) return;
      const activeBookmark = filteredBookmarks[activeIndex];
      if (!activeBookmark) return;

      if (
        e.key === "Enter" &&
        activeBookmark.url &&
        document.activeElement !== inputRef.current
      ) {
        e.preventDefault();
        window.open(activeBookmark.url, "_blank");
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        e.preventDefault();
        const textToCopy =
          activeBookmark.url || activeBookmark.color || activeBookmark.title;
        navigator.clipboard.writeText(textToCopy);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        handleStartRename(activeBookmark.id);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "Backspace") {
        e.preventDefault();
        handleDeleteBookmark(activeBookmark.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    filteredBookmarks,
    selectedIndex,
    hoveredIndex,
    renamingId,
    handleDeleteBookmark,
  ]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSelectedIndex(-1);
  }, []);

  const handleSelectGroup = useCallback((id: string) => {
    setSelectedGroupId(id);
    setSelectedIndex(-1);
  }, []);

  const handleAddBookmark = useCallback(
    (value: string) => {
      if (!currentGroupId) return;

      const lines = value
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      lines.forEach((line) => {
        const colorResult = parseColor(line);
        if (colorResult.isColor) {
          createBookmarkMutation.mutate({
            title: colorResult.original || line,
            url: "",
            type: "color",
            color: colorResult.hex,
            groupId: currentGroupId,
          });
          return;
        }

        if (isUrl(line)) {
          const url = normalizeUrl(line);
          createBookmarkMutation.mutate({
            title: new URL(url).hostname.replace("www.", ""),
            url,
            type: "link",
            groupId: currentGroupId,
          });
          return;
        }

        createBookmarkMutation.mutate({
          title: line,
          url: "",
          type: "text",
          groupId: currentGroupId,
        });
      });

      setSearchQuery("");
      setSelectedIndex(-1);
    },
    [currentGroupId, createBookmarkMutation]
  );

  const handleCreateGroup = useCallback(
    (name: string) => {
      const colors = ["#74B06F", "#4A90D9", "#E6A23C", "#9B59B6", "#E74C3C"];
      createGroupMutation.mutate(
        {
          name,
          color: colors[Math.floor(Math.random() * colors.length)],
        },
        {
          onSuccess: (newGroup) => {
            setSelectedGroupId(newGroup.id);
            setSelectedIndex(-1);
          },
        }
      );
    },
    [createGroupMutation]
  );

  const handleDeleteGroup = useCallback(
    (id: string) => {
      deleteGroupMutation.mutate(
        { id },
        {
          onSuccess: () => {
            if (currentGroupId === id) {
              const remainingGroups = groups.filter((g) => g.id !== id);
              setSelectedGroupId(remainingGroups[0]?.id || null);
              setSelectedIndex(-1);
            }
          },
        }
      );
    },
    [deleteGroupMutation, groups, currentGroupId]
  );

  const handleRenameBookmark = useCallback(
    (id: string, newTitle: string) => {
      updateBookmarkMutation.mutate({ id, title: newTitle });
    },
    [updateBookmarkMutation]
  );

  const handleMoveBookmark = useCallback(
    (id: string, groupId: string) => {
      updateBookmarkMutation.mutate({ id, groupId });
    },
    [updateBookmarkMutation]
  );

  const handleRefetchBookmark = useCallback((id: string) => {
    console.log("Refetching bookmark:", id);
  }, []);

  if (sessionPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!selectedGroup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        groups={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={handleSelectGroup}
        onCreateGroup={handleCreateGroup}
        onDeleteGroup={handleDeleteGroup}
        bookmarkCounts={bookmarkCounts}
        userName={session.user.name}
      />
      <main className="mx-auto max-w-3xl px-5 py-20">
        <BookmarkInput
          ref={inputRef}
          value={searchQuery}
          onChange={handleSearchChange}
          onSubmit={handleAddBookmark}
        />
        <BookmarkList
          bookmarks={filteredBookmarks}
          groups={groups}
          onDelete={handleDeleteBookmark}
          onRename={handleRenameBookmark}
          onMove={handleMoveBookmark}
          onRefetch={handleRefetchBookmark}
          currentGroupId={currentGroupId || ""}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          renamingId={renamingId}
          onStartRename={handleStartRename}
          onFinishRename={handleFinishRename}
          onHoverChange={setHoveredIndex}
          hoveredIndex={hoveredIndex}
        />
      </main>
    </div>
  );
}
