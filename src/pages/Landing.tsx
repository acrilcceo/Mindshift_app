import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

// Feature data based on the app's actual capabilities
const features = [
  {
    title: 'Belief Reframer',
    description: 'Identify limiting beliefs and transform them into empowering alternatives that align with your goals.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7h8" />
        <path d="M8 12h8" />
        <path d="M8 17h5" />
        <path d="M6 5h12v14H6z" />
      </svg>
    ),
  },
  {
    title: 'FTBA Journaling',
    description: 'Feel → Thought → Belief → Action. A structured journaling practice that reveals hidden patterns.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 4h10v16H7z" />
        <path d="M9 8h6" />
        <path d="M9 12h4" />
        <path d="M5 6v12" />
      </svg>
    ),
  },
  {
    title: '3-6-9 Manifestation',
    description: 'The classic scripting ritual: 3x morning, 6x afternoon, 9x evening to embed your intentions.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7h4v4H6z" />
        <path d="M14 7h4v4h-4z" />
        <path d="M10 13h4v4h-4z" />
      </svg>
    ),
  },
  {
    title: 'Ho\'oponopono Breathing',
    description: 'Calm your nervous system with guided breathing paired with the healing Hawaiian mantra.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l2 2" />
      </svg>
    ),
  },
  {
    title: 'SoundShift Studio',
    description: 'Healing frequencies and ambient soundscapes to shift your state and deepen your practice.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="9" width="3" height="6" rx="1" />
        <rect x="16" y="9" width="3" height="6" rx="1" />
        <path d="M8 11a4 4 0 0 1 8 0v2" />
      </svg>
    ),
  },
  {
    title: 'Visualization Scripts',
    description: 'Create detailed future-self visualizations to anchor your desired reality in your mind.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    quote: "MindShift has completely transformed my morning routine. I finally feel in control of my thoughts.",
    author: "Sarah K.",
    role: "Mindfulness Practitioner"
  },
  {
    quote: "The 3-6-9 method combined with the breathing exercises helped me manifest my dream job in 30 days.",
    author: "Marcus T.",
    role: "Entrepreneur"
  },
  {
    quote: "I've tried many apps but this is the first one that addresses the root of limiting beliefs.",
    author: "Priya M.",
    role: "Life Coach"
  }
];

const Landing: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-primary text-primary overflow-hidden">
      {/* Background gradient */}
      <div 
        className="fixed inset-0 z-0 animate-subtle-shift"
        style={{
          background: `
            radial-gradient(circle at 20% 15%, var(--bg-gradient-start), transparent 40%),
            radial-gradient(circle at 80% 30%, var(--bg-gradient-end), transparent 45%),
            linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary))
          `,
          backgroundSize: '150% 150%'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-accent-primary flex items-center justify-center text-btn-primary font-bold text-xl shadow-lg shadow-accent-glow transition-transform group-hover:scale-105">
              M
            </div>
            <span className="text-xl font-serif font-bold text-primary">MindShift</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-16 lg:py-24 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-primary leading-tight animate-fade-in">
            Reprogram Your Mind.
            <br />
            <span className="text-accent-primary">Manifest Your Reality.</span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-secondary max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
            A daily mental transformation companion combining belief work, manifestation rituals, and somatic practices to help you create the life you desire.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Link to="/signup">
              <Button variant="primary" size="lg" className="min-w-[180px]">
                Start Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="min-w-[180px]">
                I have an account
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '300ms' }}>
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '500K+', label: 'Beliefs Reframed' },
              { value: '1M+', label: 'Sessions Completed' },
              { value: '4.9', label: 'User Rating' },
            ].map((stat, index) => (
              <div key={index} className="card-base p-4 rounded-2xl">
                <div className="text-2xl md:text-3xl font-bold text-accent-primary">{stat.value}</div>
                <div className="text-sm text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-16 lg:py-24 lg:px-12 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-primary">
              Your Complete Transformation Toolkit
            </h2>
            <p className="mt-4 text-lg text-secondary max-w-2xl mx-auto">
              Every feature works together to help you shift beliefs, regulate emotions, and manifest your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-base p-6 rounded-2xl hover:shadow-2xl hover:shadow-accent-glow transition-all duration-500 group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-16 lg:py-24 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-primary">
              How MindShift Works
            </h2>
            <p className="mt-4 text-lg text-secondary max-w-2xl mx-auto">
              A structured daily practice that transforms your inner dialogue and aligns your energy with your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Awareness', description: 'Identify limiting beliefs and emotional patterns through FTBA journaling.' },
              { step: '02', title: 'Regulation', description: 'Calm your nervous system with guided breathing and Ho\'oponopono.' },
              { step: '03', title: 'Reframing', description: 'Transform negative beliefs into empowering affirmations.' },
              { step: '04', title: 'Manifestation', description: 'Embed new patterns with 3-6-9 rituals and visualization.' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-5xl font-bold text-accent-primary/20 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-secondary">{item.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 right-0 w-1/2 h-px bg-gradient-to-r from-accent-primary/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-6 py-16 lg:py-24 lg:px-12 bg-secondary/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-primary mb-12">
            Loved by Thousands
          </h2>

          <div className="relative">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  index === activeTestimonial
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 absolute inset-0'
                }`}
              >
                <blockquote className="text-xl md:text-2xl font-serif text-primary italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="mt-6">
                  <div className="font-semibold text-primary">{testimonial.author}</div>
                  <div className="text-sm text-muted">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeTestimonial
                    ? 'w-6 bg-accent-primary'
                    : 'bg-muted hover:bg-secondary'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-16 lg:py-24 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="card-base p-8 md:p-12 rounded-3xl text-center bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-primary">
              Ready to Transform Your Mind?
            </h2>
            <p className="mt-4 text-lg text-secondary max-w-xl mx-auto">
              Join thousands of others who are actively reprogramming their beliefs and manifesting their dreams.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="primary" size="lg" className="min-w-[200px]">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="min-w-[200px]">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 lg:px-12 border-t border-card-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent-primary flex items-center justify-center text-btn-primary font-bold text-sm">
              M
            </div>
            <span className="font-serif font-bold text-primary">MindShift Manifest</span>
          </div>
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} MindShift Manifest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
