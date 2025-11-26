"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const Header = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* LOGO + NOME (agora clicáveis) */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#4ADE80]/50 bg-[#4ADE80]/10 text-xs font-bold text-[#4ADE80]">
            GF
          </div>
          <span className="text-sm font-semibold text-slate-100 transition-colors hover:text-[#4ADE80] md:text-lg">
            GeoFire Goiás
          </span>
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden items-center gap-6 md:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-4 text-sm text-slate-300">
              <NavigationMenuItem>
                <Link href="/mapa" legacyBehavior passHref>
                  <NavigationMenuLink className="hover:text-[#4ADE80]">
                    Mapa
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/serie-historica" legacyBehavior passHref>
                  <NavigationMenuLink className="hover:text-[#4ADE80]">
                    Série histórica
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/analises-temporais" legacyBehavior passHref>
                  <NavigationMenuLink className="hover:text-[#4ADE80]">
                    Análises
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/previsoes" legacyBehavior passHref>
                  <NavigationMenuLink className="hover:text-[#4ADE80]">
                    Previsões
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Button
            variant="outline"
            className="border-[#4ADE80] text-[#4ADE80] transition-colors hover:bg-[#4ADE80]/10"
          >
            Login
          </Button>
        </div>

        {/* MENU MOBILE */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-slate-700 text-slate-200"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="border-slate-800 bg-slate-950"
            >
              <nav className="mt-10 flex flex-col gap-4 text-slate-100">
                <Link href="/mapa" className="hover:text-[#4ADE80]">
                  Mapa
                </Link>

                <Link href="/serie-historica" className="hover:text-[#4ADE80]">
                  Série histórica
                </Link>

                <Link
                  href="/analises-temporais"
                  className="hover:text-[#4ADE80]"
                >
                  Análises temporais
                </Link>

                <Link href="/previsoes" className="hover:text-[#4ADE80]">
                  Previsões
                </Link>

                <Button className="mt-4 w-full bg-[#4ADE80] text-slate-900 hover:bg-[#22C55E]">
                  Login
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
