"use client";

import { getApiV1AuthMeOptions } from "@repo/sdk/query";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { useSetAtom } from "jotai/react";
import { RESET } from "jotai/utils";

import { sessionJwtAtom } from "@/atoms/index";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();

  const { data: user, error } = useQuery({ ...getApiV1AuthMeOptions(), retry: false });
  const setSessionJwt = useSetAtom(sessionJwtAtom);

  const handleLogout = async () => {
    setSessionJwt(RESET);
    await router.options.context.queryClient.invalidateQueries({
      queryKey: getApiV1AuthMeOptions().queryKey,
    });
    await router.invalidate();
    await router.navigate({ to: "/" });
  };

  return (
    <nav className="bg-background border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-semibold">
            Reitrop
          </Link>
          {user && (
            <div className="flex gap-4 text-sm">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user && !error ? (
            <>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>
                    {user.data.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.data.name}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Link to="/">
              <Button size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
