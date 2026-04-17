import { getApiV1MiscStatusOptions } from "@repo/sdk/query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: test } = useQuery(getApiV1MiscStatusOptions());
  return (
    <div className="flex w-full bg-[#ff0000] font-serif text-7xl italic">Hello! {test?.data}</div>
  );
}
