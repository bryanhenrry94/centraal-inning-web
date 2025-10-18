import { ReactNode } from "react";
import Header from "./header";
import Navigation from "./navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import LoadingUI from "@/components/ui/loading-ui";

export const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const { user } = useAuthSession();

  if (!user) {
    return <LoadingUI />;
  }

  return (
    <>
      <Header />
      <div className="flex-1 flex flex-col">
        <Navigation role={user.role} />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </>
  );
};
