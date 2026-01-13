"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Landing() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <header className="mx-auto mb-16 mt-20 flex max-w-md flex-col items-center justify-center text-center sm:mb-20 sm:mt-32">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mb-3 text-4xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl hover:opacity-80 transition-opacity"
            title="Toggle theme"
            type="button"
          >
            kolekta
          </button>
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            collect. organize. discover.
          </p>
          <div className="mt-8 flex gap-3 items-center">
            <Link
              href="/login"
              className="rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-200 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-zinc-900 dark:bg-zinc-50 px-6 py-2.5 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              Get started
            </Link>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<BookmarkIcon />}
            title="Quick Save"
            description="Paste any URL and save instantly"
          />
          <FeatureCard
            icon={<GroupIcon />}
            title="Collections"
            description="Organize links into groups"
          />
          <FeatureCard
            icon={<SearchIcon />}
            title="Search"
            description="Find any bookmark in seconds"
          />
          <FeatureCard
            icon={<LockIcon />}
            title="Private"
            description="Your bookmarks stay yours alone"
          />
          <FeatureCard
            icon={<MetadataIcon />}
            title="Metadata"
            description="Auto-fetch titles and favicons"
          />
          <FeatureCard
            icon={<KeyboardIcon />}
            title="Keyboard First"
            description="Navigate with shortcuts"
          />
        </div>

        <footer className="mb-12 mt-20 text-center text-sm text-zinc-400 sm:mb-20">
          <div className="mb-4 flex flex-wrap flex-row items-center justify-center gap-1">
            <a
              href="/terms"
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              Terms
            </a>
            <span className="text-zinc-300">·</span>
            <a
              href="/privacy"
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              Privacy
            </a>
          </div>
          <p className="text-zinc-400">
            © {new Date().getFullYear()} kolekta
          </p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 transition-all hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-sm">
      <div className="mb-3 text-zinc-600 dark:text-zinc-400">{icon}</div>
      <h2 className="mb-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}

function BookmarkIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M17.4 1.427c1.214 0 2.15.936 2.15 2.15v17.528c0 .571-.298 1.055-.762 1.3-.455.241-1.01.222-1.474-.057a.506.506 0 0 1-.045-.03l-5.27-3.697-5.269 3.698a.512.512 0 0 1-.045.03c-.479.287-1.045.284-1.494.072-.462-.22-.841-.687-.841-1.316V3.577c0-1.214.936-2.15 2.15-2.15H17.4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function GroupIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M22.5 14H19a1 1 0 0 0-1 1 1 1 0 0 1-1 1H7a1 1 0 0 1-1-1 1 1 0 0 0-1-1H1.5A1.5 1.5 0 0 0 0 15.5V22a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-6.5a1.5 1.5 0 0 0-1.5-1.5Z"
      />
      <path
        fill="currentColor"
        d="M9.5 12a1 1 0 0 0 0 2h5a1 1 0 0 0 0-2ZM2.5 11a1 1 0 0 0 1-1h17a1 1 0 0 0 2 0 2 2 0 0 0-2-2h-17a2 2 0 0 0-2 2 1 1 0 0 0 1 1ZM2.5 7a1 1 0 0 0 1-1h17a1 1 0 0 0 2 0 2 2 0 0 0-2-2h-17a2 2 0 0 0-2 2 1 1 0 0 0 1 1ZM2.5 3a1 1 0 0 0 1-1h17a1 1 0 0 0 2 0 2 2 0 0 0-2-2h-17a2 2 0 0 0-2 2 1 1 0 0 0 1 1Z"
      />
    </svg>
  );
}

function SearchIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M15.67 6a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0"
      />
      <path
        fill="currentColor"
        d="M10.58 16.53a5.52 5.52 0 0 0 8.5 4.66.26.26 0 0 1 .31 0l2.48 2.49a1 1 0 0 0 .71.29 1 1 0 0 0 .71-.29 1 1 0 0 0 0-1.42l-2.49-2.45a.24.24 0 0 1 0-.31 5.53 5.53 0 1 0-10.19-3Zm9.06 0A3.53 3.53 0 1 1 16.11 13a3.54 3.54 0 0 1 3.53 3.53Z"
      />
      <path
        fill="currentColor"
        d="M21.17 0H14a3 3 0 0 0-2.12.88l-11 11a3 3 0 0 0 0 4.24l6.17 6.17a3 3 0 0 0 4.24 0l.14-.14a.23.23 0 0 0 .07-.15.23.23 0 0 0-.08-.18 7.17 7.17 0 0 1-1-1.06.25.25 0 0 0-.18-.1.27.27 0 0 0-.19.08l-.17.17a1 1 0 0 1-1.42 0l-6.17-6.2a1 1 0 0 1 0-1.42l11-11A1 1 0 0 1 14 2h6.67a.5.5 0 0 1 .5.5v6.67a1 1 0 0 1-.29.71l-.67.67a.27.27 0 0 0-.08.19.29.29 0 0 0 .1.18 7.67 7.67 0 0 1 1.06 1 .21.21 0 0 0 .18.09.26.26 0 0 0 .19-.07l.63-.64a3 3 0 0 0 .88-2.12V2a2 2 0 0 0-2-2Z"
      />
    </svg>
  );
}

function LockIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M12 21.26a7.56 7.56 0 0 1-2.66.48.75.75 0 1 0 0 1.5 9.1 9.1 0 0 0 2.82-.45.26.26 0 0 0 .18-.23v-1.07a.27.27 0 0 0-.11-.2.24.24 0 0 0-.23-.03Z"
      />
      <path
        fill="currentColor"
        d="M17.12 9.27a.29.29 0 0 0 .1.27.26.26 0 0 0 .21.05 4.13 4.13 0 0 1 1-.1.21.21 0 0 0 .21-.22 9.14 9.14 0 0 0-1.94-5.65.75.75 0 0 0-1-.14.72.72 0 0 0-.13 1.05 7.79 7.79 0 0 1 1.55 4.74Z"
      />
      <path
        fill="currentColor"
        d="M6.36 21.13A7.74 7.74 0 0 1 1.62 14v-1.9a.74.74 0 0 0-.74-.75.75.75 0 0 0-.76.75V14a9.23 9.23 0 0 0 5.66 8.52.72.72 0 0 0 .29.06.75.75 0 0 0 .29-1.44Z"
      />
      <path
        fill="currentColor"
        d="M.85 9.54a.75.75 0 0 0 .79-.71 7.75 7.75 0 0 1 11.61-6.28.75.75 0 0 0 1-.27.76.76 0 0 0-.28-1A9.25 9.25 0 0 0 .14 8.75a.74.74 0 0 0 .71.79Z"
      />
      <path
        fill="currentColor"
        d="M14.47 11.41a.26.26 0 0 0 .28-.09 4.19 4.19 0 0 1 .94-.94.23.23 0 0 0 .1-.2v-.91a6.41 6.41 0 0 0-8.41-6.1.75.75 0 0 0 .45 1.43 4.75 4.75 0 0 1 1.55-.25 4.93 4.93 0 0 1 4.91 4.92v1.9a.25.25 0 0 0 .18.24Z"
      />
      <path
        fill="currentColor"
        d="M12.25 18.14a.24.24 0 0 0-.26 0 4.88 4.88 0 0 1-2.61.76A4.93 4.93 0 0 1 4.46 14V9.27A5 5 0 0 1 5.71 6a.76.76 0 0 0 0-1.06.77.77 0 0 0-1.12.06A6.43 6.43 0 0 0 3 9.27V14a6.42 6.42 0 0 0 6.42 6.42 6.35 6.35 0 0 0 2.86-.69.26.26 0 0 0 .14-.22v-1.15a.25.25 0 0 0-.17-.22Z"
      />
      <path
        fill="currentColor"
        d="M9.38 5.68a3.59 3.59 0 0 0-3.59 3.59v1.41a.75.75 0 0 0 1.5 0V9.27a2.09 2.09 0 1 1 4.17 0V14a2.09 2.09 0 0 1-4.17 0 .75.75 0 1 0-1.5 0 3.59 3.59 0 0 0 6.56 2 .28.28 0 0 0 0-.13 1.79 1.79 0 0 1 .46-1.14.31.31 0 0 0 .06-.13A4 4 0 0 0 13 14V9.27a3.59 3.59 0 0 0-3.62-3.59Z"
      />
      <path
        fill="currentColor"
        d="M10.12 13.51v-2.83a.75.75 0 0 0-.74-.75.76.76 0 0 0-.76.75v2.83a.75.75 0 0 0 .76.75.74.74 0 0 0 .74-.75Z"
      />
      <path
        fill="currentColor"
        d="M22.59 15.5a.25.25 0 0 1-.21-.25v-1a3.5 3.5 0 0 0-7 0v1a.26.26 0 0 1-.22.25 1.5 1.5 0 0 0-1.28 1.5v5.5a1.5 1.5 0 0 0 1.5 1.5h7a1.51 1.51 0 0 0 1.5-1.5V17a1.51 1.51 0 0 0-1.29-1.5Zm-3.71 5.74a1 1 0 1 1 1-1 1 1 0 0 1-1 1Zm1.5-6a.26.26 0 0 1-.26.25h-2.5a.25.25 0 0 1-.24-.25v-1a1.5 1.5 0 1 1 3 0Z"
      />
    </svg>
  );
}

function MetadataIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M12 .5A4.51 4.51 0 0 0 7.5 5v3.13a1 1 0 1 0 2 0V5a2.5 2.5 0 0 1 5 0v5.5A2.5 2.5 0 0 1 12 13a1 1 0 0 0 0 2 4.51 4.51 0 0 0 4.5-4.5V5A4.51 4.51 0 0 0 12 .5Z"
      />
      <path
        fill="currentColor"
        d="M15.5 15.63a1 1 0 0 0-1 1V19a2.5 2.5 0 0 1-5 0v-5a2.5 2.5 0 0 1 2.5-2.5 1 1 0 0 0 0-2A4.51 4.51 0 0 0 7.5 14v5a4.5 4.5 0 0 0 9 0v-2.37a1 1 0 0 0-1-1Z"
      />
      <path
        fill="currentColor"
        d="m5.24 6.88-1.3-.75a1 1 0 1 0-1 1.74l1.3.75a1 1 0 0 0 1.36-.37 1 1 0 0 0-.36-1.37ZM4 12.5a1 1 0 0 0 0-2H2.5a1 1 0 0 0 0 2Zm.24 1.88-1.3.75a1 1 0 0 0 1 1.74l1.3-.75a1 1 0 0 0-1-1.74ZM19.26 8.75a1 1 0 0 0 .5-.13l1.3-.75a1 1 0 0 0-1-1.74l-1.3.75a1 1 0 0 0 .5 1.87ZM21.5 10.5H20a1 1 0 0 0 0 2h1.5a1 1 0 0 0 0-2Zm-.44 4.63-1.3-.75a1 1 0 0 0-1 1.74l1.3.75a1 1 0 1 0 1-1.74Z"
      />
    </svg>
  );
}

function KeyboardIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M5.75 10.25h13.5c2.65 0 4.5-1.64 4.5-4s-1.85-4-4.5-4h-6a1 1 0 0 1-1-1 1 1 0 0 0-2 0 3 3 0 0 0 3 3h6c1.21 0 2.5.53 2.5 2s-1.29 2-2.5 2H5.75c-2.29 0-4 2.38-4 4.5v.75a.25.25 0 0 1-.25.25h-.25a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H4a.25.25 0 0 1-.25-.25v-.75c0-1.12.92-2.5 2-2.5Zm-1.5 9.5h-.5a.5.5 0 0 1 0-1h.5a.5.5 0 0 1 0 1Zm14.5-3.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1 0-1Zm0 2.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1 0-1Zm-3-2.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1 0-1Zm0 2.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1 0-1Zm-3-2.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1 0-1Zm0 2.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1 0-1Zm-3-2.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1 0-1Zm0 2.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1 0-1Zm-3-2.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1 0-1Zm0 2.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1 0-1Zm-1 2.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1 0-1Zm-1.5-5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1 0-1Z"
      />
    </svg>
  );
}

function LayoutIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M8 0H3a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3Zm1 8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1Z"
      />
      <path
        fill="currentColor"
        d="M8 13H3a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-5a3 3 0 0 0-3-3Zm1 8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1Z"
      />
      <path
        fill="currentColor"
        d="M14.25 3h9a.75.75 0 0 0 0-1.5h-9a.75.75 0 0 0 0 1.5ZM23.25 4.5h-9a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5ZM23.25 7.5h-9a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5ZM23.25 14.5h-9a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5ZM23.25 17.5h-9a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5ZM23.25 20.5h-9a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5Z"
      />
    </svg>
  );
}

function GlobeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M2.23 12.049c0-5.393 4.328-9.721 9.721-9.721 2.666 0 5.1 1.104 6.87 2.857l-.42.29a1.003 1.003 0 0 0 .363 1.803l2.34.487c.039.008.079.014.118.017a.998.998 0 0 0 .637-.075l.003-.002a1.003 1.003 0 0 0 .428-.646l.485-2.426a1.003 1.003 0 0 0-1.548-1.02l-.735.508C18.349 1.774 15.312.328 11.951.328 5.454.328.23 5.551.23 12.049c0 .552.448 1 1 1 .553 0 1-.448 1-1Zm6.929-6.441a10.553 10.553 0 0 0-3.42 3.273h2.662c.17-1.123.43-2.223.758-3.273ZM5.195 10.38c-.123.52-.188 1.062-.188 1.62 0 .594.074 1.17.213 1.722h3.036a20.57 20.57 0 0 1-.073-2.537c.01-.269.025-.537.046-.805H5.2l-.006 0Zm.596 4.842c.754 1.45 2.001 2.602 3.52 3.235a20.576 20.576 0 0 1-.853-3.235H5.79Zm5.315 3.715c.293.037.591.057.894.057.303 0 .601-.02.894-.057l.024-.067c.488-1.177.857-2.397 1.096-3.648H9.986c.239 1.251.608 2.471 1.095 3.648l.025.067Zm3.584-.48a10.55 10.55 0 0 0 3.519-3.235h-2.666c-.193 1.104-.48 2.185-.853 3.236Zm4.09-4.735c.14-.551.214-1.128.214-1.723 0-.557-.065-1.1-.188-1.619l-.007 0h-3.027c.02.268.036.536.046.805.032.855.006 1.702-.073 2.537h3.035Zm-.519-4.842c-.723-1.449-1.935-2.612-3.42-3.273.328 1.05.587 2.15.758 3.273h2.662Zm-5.164-3.789c-.357-.056-.724-.085-1.097-.085-.374 0-.74.029-1.098.085l-.031.114c-.42 1.163-.747 2.404-.954 3.675h4.165c-.207-1.27-.535-2.512-.953-3.675-.014-.038-.024-.076-.032-.114Zm1.22 6.132c.032.842.003 1.676-.083 2.499H9.765a18.598 18.598 0 0 1-.083-2.499c.01-.281.027-.562.05-.843h4.535c.023.28.04.562.05.843ZM1.443 14.01a1.003 1.003 0 0 1 1.236.687 9.222 9.222 0 0 0 3.011 4.688 1.003 1.003 0 0 1-1.317 1.505 11.219 11.219 0 0 1-3.617-5.644 1.003 1.003 0 0 1 .687-1.236Zm6.431 6.87a1.003 1.003 0 0 0-.812 1.828c.956.425 2.003.737 3.037.944a1.003 1.003 0 0 0 .392-1.961 13.09 13.09 0 0 1-2.617-.81Zm8.437.987a1.003 1.003 0 0 0 .633 1.898c-.677.226-1.34.333-2.027.431a1.003 1.003 0 0 1-.283-1.98c.677-.096 1.185-.184 1.677-.349Zm3.672-1.242a1.003 1.003 0 0 0-1.25-1.562l-1.461 1.17a1.003 1.003 0 0 0 1.25 1.561l1.461-1.17Zm2.26-5.184a1.003 1.003 0 0 0-1.895-.894l-.585 1.17a1.003 1.003 0 0 0 1.895.894l.584-1.17Zm1.527-3.004c0-.552-.448-1-1-1-.553 0-1 .448-1 1 0 .425-.01.548-.046.658a1.003 1.003 0 0 0 1.897.633c.15-.45.15-.889.149-1.235v-.056Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
