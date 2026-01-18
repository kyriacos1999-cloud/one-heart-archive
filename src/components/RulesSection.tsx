const RulesSection = () => {
  const rules = [
    "No likes",
    "No comments",
    "No rankings",
    "One heart per entry",
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="max-w-xl mx-auto text-center">
        <h3 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-10">
          The Rules
        </h3>
        
        <ul className="space-y-4">
          {rules.map((rule, index) => (
            <li
              key={index}
              className="text-muted-foreground text-lg font-light"
            >
              {rule}
            </li>
          ))}
        </ul>
        
        <p className="mt-12 font-serif text-lg italic text-foreground">
          Love doesn't need applause.
        </p>
      </div>
    </section>
  );
};

export default RulesSection;
