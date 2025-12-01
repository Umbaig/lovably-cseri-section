const steps = [
  {
    number: 1,
    title: "Understand Yourself",
    description: "Start by assessing your own perspective on team dynamics and identify your personal strengths in collaboration.",
    badgeClass: "step-badge-1",
  },
  {
    number: 2,
    title: "Understand Your Team",
    description: "Get team and personal reports for every assessment, highlighting your team's strengths and weaknesses. Learn why your team operates the way it does.",
    badgeClass: "step-badge-2",
  },
  {
    number: 3,
    title: "Turn Insights into Action",
    description: "Complete self-directed workshops to reflect on your team's results – turning insights into action and cultivating deeper, more effective working relationships.",
    badgeClass: "step-badge-3",
  },
];

const ProcessSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={`${step.badgeClass} w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                <span className="text-xl font-bold text-primary-foreground">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
