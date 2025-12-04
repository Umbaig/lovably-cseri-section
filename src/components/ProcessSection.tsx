const steps = [
  {
    number: 1,
    title: "Invite & Assess",
    description: "Send quick assessments to your team. Each member answers a short set of questions about how the team works together.",
    badgeClass: "step-badge-1",
  },
  {
    number: 2,
    title: "Get Your Team Report",
    description: "Receive a clear report showing your team's strengths and areas to improve. Discover who are the Doers, Thinkers, Socializers, and Organizers on your team.",
    badgeClass: "step-badge-2",
  },
  {
    number: 3,
    title: "Reflect & Improve",
    description: "Choose a guided workshop to discuss results with your team. Turn insights into real actions that make your team stronger.",
    badgeClass: "step-badge-3",
  },
];

const ProcessSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            How it works in 3 steps
          </h2>
        </div>
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
