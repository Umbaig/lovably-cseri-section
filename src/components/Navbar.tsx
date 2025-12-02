import { Button } from "@/components/ui/button";
import teamHealthLogo from "@/assets/teamhealth-logo.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={teamHealthLogo} alt="TeamHealth" className="h-10 w-auto" />
          </a>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
              Services
            </a>
            <a href="#about" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
              About
            </a>
            <a href="#contact" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
              Contact
            </a>
          </div>

          <Button variant="default" size="sm">
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
