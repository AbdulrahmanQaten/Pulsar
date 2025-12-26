import { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20 md:pt-14 md:pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;