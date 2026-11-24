<script lang="ts">
  import "../app.css";
  import { page } from "$app/state";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { Toaster } from "svelte-sonner";
  import Navbar from "#lib/components/layout/Navbar.svelte";
  import Sidebar from "#lib/components/layout/Sidebar.svelte";
  import { createAppQueryClient } from "#lib/queries/client.ts";
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();
  const queryClient = createAppQueryClient();
  // The sign-in screen has no sidebar or navbar (they would call the API before a session exists).
  const bare = $derived(page.url.pathname === "/login");

  let isIntegrated = $state(false);

  $effect(() => {
    if (
      !["/crm", "/projects", "/settings"].some((p) =>
        page.url.pathname.startsWith(p)
      )
    ) {
      isIntegrated = false;
    } else {
      isIntegrated = true;
    }
  });
</script>

<svelte:head>
  <title>PURE ERP</title>
  <link rel="icon" href="/images/favicon.png" />
</svelte:head>

<QueryClientProvider client={queryClient}>
  {#if bare}
    {@render children()}
  {:else}
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2"
    >
      Skip to content
    </a>
    <div class="flex min-h-dvh">
      <Sidebar />
      <div class="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main id="main" class="min-w-0 flex-1 px-4 py-5 sm:px-5">
          {#if !isIntegrated}
            <div
              class="flex items-center justify-center w-full bg-red-50 p-4 border border-red-500 rounded mb-3"
            >
              <p class="text-red-500 font-medium">
                This Page is only done fo UI work. API are still need to
                integrate and data are only dummy.
              </p>
            </div>
          {/if}

          {@render children()}
        </main>
      </div>
    </div>
  {/if}
  <Toaster position="top-right" richColors closeButton />
</QueryClientProvider>
