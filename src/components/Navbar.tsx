import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">TeamCheck</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors font-medium outline-none">
                Products <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Team Assessment</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/quick-test" className="cursor-pointer">
                    Quick Test
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/diagnostics" className="cursor-pointer">
                    Standard Team Check
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>AI Seamless Team Assessment</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/meeting-vibe-check" className="cursor-pointer">
                    Meeting Vibe Check
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Team Knowledge Check Tests</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/scrum-roles-quiz" className="cursor-pointer">
                    Roles & Responsibilities in Scrum
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <a href="#about" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
              About
            </a>
            <a href="#contact" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
              Contact
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
