import type { User } from "@sentry/react";

export function ProfileCard({ user }: { user: User }) {
  return (
    <div className="mb-8 rounded-lg border p-6">
      <h2 className="mb-2 text-lg font-semibold">Profile Information</h2>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Name:</span> {user.name}
        </div>
        <div>
          <span className="font-medium">Email:</span> {user.email}
        </div>
        <div>
          <span className="font-medium">Role:</span> {user.role}
        </div>
        <div>
          <span className="font-medium">Status:</span> {user.status}
        </div>
      </div>
    </div>
  );
}
