"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const Header = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* LOGO + NOME */}
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
              {/* Mapa */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/mapa"
                    className="transition-colors hover:text-[#4ADE80]"
                  >
                    Mapa
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Série Histórica */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/serie-historica"
                    className="transition-colors hover:text-[#4ADE80]"
                  >
                    Série histórica
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Análises (Dropdown escuro corrigido) */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-slate-300 transition-colors hover:text-[#4ADE80] focus:text-[#4ADE80] data-[state=open]:text-[#4ADE80]">
                  Análises
                </NavigationMenuTrigger>

                <NavigationMenuContent className="rounded-md border border-slate-800 bg-slate-900 text-slate-100 shadow-xl shadow-black/20">
                  <ul className="flex w-[220px] flex-col gap-2 p-3">
                    <NavigationMenuLink asChild>
                      <li>
                        <Link
                          href="/analises-temporais"
                          className="block rounded-md p-3 text-sm transition-colors select-none hover:bg-slate-800 hover:text-white"
                        >
                          Sazonal
                        </Link>
                      </li>
                    </NavigationMenuLink>

                    <NavigationMenuLink asChild>
                      <li>
                        <Link
                          href="/analises/tendencia"
                          className="block rounded-md p-3 text-sm transition-colors select-none hover:bg-slate-800 hover:text-white"
                        >
                          Tendência
                        </Link>
                      </li>
                    </NavigationMenuLink>

                    <NavigationMenuLink asChild>
                      <li>
                        <Link
                          href="/analises/previsao"
                          className="block rounded-md p-3 text-sm transition-colors select-none hover:bg-slate-800 hover:text-white"
                        >
                          Previsão
                        </Link>
                      </li>
                    </NavigationMenuLink>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Previsões */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/previsoes"
                    className="transition-colors hover:text-[#4ADE80]"
                  >
                    Previsões
                  </Link>
                </NavigationMenuLink>
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
                  Sazonal
                </Link>
                <Link
                  href="/analises/tendencia"
                  className="hover:text-[#4ADE80]"
                >
                  Tendência
                </Link>
                <Link
                  href="/analises/previsao"
                  className="hover:text-[#4ADE80]"
                >
                  Previsão
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
