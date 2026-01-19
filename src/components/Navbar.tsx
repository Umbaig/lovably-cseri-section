import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">TeamCheck</span>
          </a>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
              About
            </a>
            <Link to="/quick-test" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
              Quick Test
            </Link>
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
