"use client";

import { getApiV1AuthMeOptions, postApiV1AuthLoginMutation } from "@repo/sdk/query";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useSetAtom } from "jotai/react";
import { flushSync } from "react-dom";

import { sessionJwtAtom } from "@/atoms/index";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  ssr: false,
  loader: async ({ context }) => {
    try {
      await context.queryClient.fetchQuery(getApiV1AuthMeOptions());
      console.log("User is already authenticated, redirecting to dashboard...");
      return redirect({ to: "/dashboard" });
    } catch {
      // No valid session, stay on login page
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();

  const { mutateAsync: login, ...loginMutation } = useMutation(postApiV1AuthLoginMutation());
  const setSessionJwt = useSetAtom(sessionJwtAtom);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const loginResponse = await login({ body: { email, password } });
    flushSync(() => {
      setSessionJwt(loginResponse.data.token);
    });

    await router.navigate({ to: "/dashboard" });
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@admin.com"
                required
                defaultValue="admin@admin.com"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                defaultValue="password"
              />
            </Field>
            {loginMutation.error && (
              <p className="text-sm text-destructive">
                {loginMutation.error.message || "Invalid email or password"}
              </p>
            )}
          </FieldGroup>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
