"use client";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartSync } from "./CartSync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <CartSync />
        {children}
      </AuthProvider>
    </Provider>
  );
}
