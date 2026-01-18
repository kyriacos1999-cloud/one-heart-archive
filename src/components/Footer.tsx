import HeartIcon from "./HeartIcon";

const Footer = () => {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-2xl mx-auto text-center">
        <HeartIcon className="w-6 h-6 mx-auto mb-6 opacity-50" />
        
        <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
          This project will close once full. If it ever goes offline, the archive will be released publicly.
        </p>
        
        <p className="mt-4 text-sm text-muted-foreground">
          Created independently. No ads. No sponsors.
        </p>
        
        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Share on Twitter"
          >
            Share
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
